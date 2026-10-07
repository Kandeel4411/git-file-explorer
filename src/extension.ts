import * as vscode from 'vscode';
import { GitFileExplorerProvider } from './gitFileExplorer';
import { debounce } from './debounce';
import { isNoisePath } from './watchFilter';

export function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const provider = new GitFileExplorerProvider();

  // Coalesce bursts of watcher events into a single refresh, so a flurry of file
  // changes (e.g. a tool rewriting its cache) triggers one git call, not hundreds.
  const scheduleRefresh = debounce(() => void provider.refresh(), 300);

  context.subscriptions.push(
    vscode.window.createTreeView('gitFileExplorer', {
      treeDataProvider: provider,
      dragAndDropController: provider,
    }),
    vscode.window.registerFileDecorationProvider(provider),

    vscode.commands.registerCommand('gitFileExplorer.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('gitFileExplorer.newFile', (node) => provider.newFile(node)),
    vscode.commands.registerCommand('gitFileExplorer.newFolder', (node) => provider.newFolder(node)),
    vscode.commands.registerCommand('gitFileExplorer.deleteItem', (node) => provider.deleteItem(node)),
    vscode.commands.registerCommand('gitFileExplorer.renameItem', (node) => provider.renameItem(node)),
    vscode.commands.registerCommand('gitFileExplorer.focusDir', (node) => provider.focusDir(node)),
    vscode.commands.registerCommand('gitFileExplorer.unfocusDir', (node) => provider.unfocusDir(node)),
  );

  // Refresh on git index changes (stage/unstage/commit)
  const gitWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceRoot, '.git/index'),
  );
  gitWatcher.onDidChange(() => scheduleRefresh());
  gitWatcher.onDidCreate(() => scheduleRefresh());
  context.subscriptions.push(gitWatcher);

  // Refresh when files are created or deleted, ignoring high-churn tool/VCS dirs.
  const fsWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceRoot, '**/*'),
  );
  const onFsEvent = (uri: vscode.Uri) => {
    if (!isNoisePath(uri.fsPath)) scheduleRefresh();
  };
  fsWatcher.onDidCreate(onFsEvent);
  fsWatcher.onDidDelete(onFsEvent);
  context.subscriptions.push(fsWatcher);
}

export function deactivate() {}
