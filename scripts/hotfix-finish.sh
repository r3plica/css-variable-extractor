#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source utils.sh from the script's directory
source "$SCRIPT_DIR/utils.sh"

latest_hotfix=$(git branch -r | grep 'origin/hotfix/' | sort -V | tail -n 1)
if [ -z "$latest_hotfix" ]; then
  echo "No hotfix branches found!"
  exit 1
fi

# Get our hotfix name
hotfix_name=$(echo "$latest_hotfix" | sed 's|origin/hotfix/||' | xargs)
if [ -z "$hotfix_name" ]; then
  echo "Error: Hotfix name is empty!"
  exit 1
fi

# Check if on the correct branch
check_out_branch "hotfix/$hotfix_name"

# update version
new_version=$(update_version hotfix/$hotfix_name)
echo "Bumping version to $new_version"

git add . || { echo "Failed to add changes"; exit 1; }
git commit -m "Bump version to $new_version" || { echo "Failed to commit changes"; exit 1; }

# Get the tag
commit_hash=$(git rev-parse --short HEAD)
full_version="${new_version}-${commit_hash}"
full_version="${full_version//[^a-zA-Z0-9._-]/}"

# Finish the hotfix
git diff-index --quiet HEAD -- || { echo "Uncommitted changes detected"; exit 1; }
git tag "$full_version" || { echo "Failed to create tag"; exit 1; }
git flow hotfix finish "$hotfix_name" || { echo "Failed to finish hotfix"; exit 1; }
git push origin master develop --follow-tags || { echo "Failed to push branch and tags to master"; exit 1; }
git push origin develop || { echo "Failed to push to develop"; exit 1; }

# Delete the remote branch
delete_branch "$latest_hotfix"

echo "Hotfix '$hotfix_name' finished and pushed!"
exit 0
