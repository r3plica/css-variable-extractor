#!/bin/bash

# Fetch the latest changes from the remote
git fetch --prune

# Define protected branches
protected_branches=("master" "develop")

# Ensure the current branch is not deleted
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ ! " ${protected_branches[@]} " =~ " ${current_branch} " ]]; then
  echo "Switching to protected branch: master"
  git checkout master
fi

# Delete all local branches that have been merged into the current branch
echo "Deleting merged local branches..."
git branch --merged | grep -v "\*" | grep -Ev "$(IFS='|'; echo "${protected_branches[*]}")" | xargs -r git branch -d

# Delete all remote branches that have been merged into the current branch
echo "Deleting merged remote branches..."
git branch -r --merged | grep -Ev "$(IFS='|'; echo "origin/(${protected_branches[*]})")" | grep -v "HEAD" | sed 's|origin/||' | xargs -r -I {} git push origin --delete {}

echo "Cleanup complete!"
