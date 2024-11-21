#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source utils.sh from the script's directory
source "$SCRIPT_DIR/utils.sh"

# Check if on the correct branch
check_out_branch "master"

# Get the hotfix name from the argument
name=$1
if [ -z "$name" ]; then
  echo "Error: Please provide a hotfix name."
  exit 1
fi

# Start the hotfix using git flow
git flow hotfix start "$name" || { echo "Error: Failed to start hotfix '$name'."; exit 1; }

# Push the hotfix branch to the remote
git push origin "hotfix/$name" || { echo "Error: Failed to push hotfix branch to origin."; exit 1; }

# Push tags (optional, but recommended to push tags)
git push origin --tags || { echo "Error: Failed to push tags."; exit 1; }

echo "Hotfix '$name' started and pushed to origin successfully!"

exit 0
