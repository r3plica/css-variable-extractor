#!/bin/bash

check_out_branch() {
  local branch_name=$1  # The branch name to check against
  local current_branch  # Declare current_branch as local

  # Get the current branch
  current_branch=$(git rev-parse --abbrev-ref HEAD)

  # If not on the specified branch, check out the branch
  if [ "$current_branch" != "$branch_name" ]; then
    echo "Warning: You are not on the '$branch_name' branch. Checking out $branch_name..."
    git checkout "$branch_name" || { echo "Error: Failed to checkout $branch_name."; exit 1; }
    git pull origin "$branch_name" || { echo "Error: Failed to pull the latest changes from $branch_name."; exit 1; }
  else
    echo "You are already on the '$branch_name' branch."
  fi
}

delete_branch() {
  local branch_name=$1  # The branch name to check against

  # Fetch the latest changes and prune deleted remote branches
  git fetch --prune || { echo "Error: Failed to fetch latest branches."; exit 1; }

  # Delete the local branch
  git branch -d "$branch_name" || { echo "Failed to delete local branch '$branch_name'"; exit 1; }

  # Delete the remote branch
  git push origin --delete "$branch_name" || { echo "Failed to delete remote branch '$branch_name'"; exit 1; }
}
