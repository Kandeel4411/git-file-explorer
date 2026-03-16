#!/bin/sh
set -e

REPO="Kandeel4411/git-scope"
VSIX=$(gh release download --repo "$REPO" --pattern "*.vsix" --dir /tmp/git-scope --clobber 2>&1 | grep -o '[^ ]*\.vsix' || true)

VSIX_PATH=$(ls /tmp/git-scope/*.vsix 2>/dev/null | head -1)
if [ -z "$VSIX_PATH" ]; then
  echo "Failed to download .vsix"
  exit 1
fi

code --install-extension "$VSIX_PATH"
echo "Installed. Reload VSCode to apply."
