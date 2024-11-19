#!/bin/bash

source ./utils.sh

latest_hotfix=$(git branch -r | grep 'origin/hotfix/' | sort -V | tail -n 1)

if [ -z "$latest_hotfix" ]; then
  echo "No hotfix branches found!"
  exit 1
fi

# Check if on the correct branch
check_out_branch "$latest_hotfix"

hotfix_name=$(echo "$latest_hotfix" | sed 's|origin/hotfix/||' | xargs)
old_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)
echo "Current version: $old_version"

npx release-it --no-commit --no-tag --no-push --patch --git-verify-collaborator=false || { echo "Failed to bump version"; exit 1; }

new_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)
echo "New version: $new_version"

if [ "$old_version" == "$new_version" ]; then
  echo "Error: release-it did not update package.json version!"
  exit 1
fi

git add . || { echo "Failed to add changes"; exit 1; }
git commit -m "Bump version to $new_version" || { echo "Failed to commit changes"; exit 1; }

commit_hash=$(git rev-parse --short HEAD)
full_version="${new_version}-${commit_hash}"

git tag "$full_version" || { echo "Failed to create tag"; exit 1; }
git flow hotfix finish "$hotfix_name" || { echo "Failed to finish hotfix"; exit 1; }
git push origin master || { echo "Failed to push to master"; exit 1; }
git push origin develop || { echo "Failed to push to develop"; exit 1; }
git push --follow-tags || { echo "Failed to push tags"; exit 1; }

# Delete the remote branch
delete_branch "$latest_hotfix"

echo "Hotfix '$hotfix_name' finished and pushed!"
exit 0
