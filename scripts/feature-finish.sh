#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source utils.sh from the script's directory
source "$SCRIPT_DIR/utils.sh"

current_branch=$(git rev-parse --abbrev-ref HEAD)

# Check if on the correct branch
check_out_branch "$current_branch"

# Get the feature name from the current branch
feature_name=${current_branch#feature/}

# Pull the latest changes from the remote feature branch
git pull origin "$current_branch" || { echo "Failed to pull changes from the feature branch"; exit 1; }

# Finish the feature using git flow (merges into develop)
git flow feature finish "$feature_name" || { echo "Failed to finish feature '$feature_name'."; exit 1; }

# Push develop and tags (if any)
git push origin develop --tags || { echo "Failed to push to develop or tags"; exit 1; }

# Delete the remote branch
delete_branch "$current_branch"

echo "Feature '$current_branch' finished, merged into develop, and remote branch deleted."
exit 0
