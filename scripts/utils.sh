#!/bin/bash

check_out_branch() {
  local branch_name=$1  # The branch name to check against
  local current_branch  # Declare current_branch as local

  if [ -z "$branch_name" ]; then
    echo "Error: No branch name provided to check_out_branch."
    exit 1
  fi

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
  local branch_name=$1  # The branch name to delete

  if [ -z "$branch_name" ]; then
    echo "Error: No branch name provided to delete_branch."
    exit 1
  fi

  # Fetch the latest changes and prune deleted remote branches
  git fetch --prune || { echo "Error: Failed to fetch latest branches."; exit 1; }

  # Delete the local branch
  git branch -d "$branch_name" || { echo "Failed to delete local branch '$branch_name'"; exit 1; }

  # Delete the remote branch
  git push origin --delete "$branch_name" || { echo "Failed to delete remote branch '$branch_name'"; exit 1; }
}

update_version() {
  local old_version new_version

  # Check if package.json exists
  if [ ! -f "package.json" ]; then
    echo "Error: package.json not found!"
    exit 1
  fi

  old_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)
  echo "Current version: $old_version"

  # Run release-it to bump the version
  npx release-it --no-commit --no-tag --no-push --patch --npm.publish=false --git.verifyCollaborator=false --ci || {
    echo "Failed to bump version"; exit 1;
  }

  new_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)
  echo "New version: $new_version"

  # Verify the version was updated
  if [ "$old_version" == "$new_version" ]; then
    echo "Error: release-it did not update package.json version!"
    exit 1
  fi

  # Return the new version
  echo "$new_version"
}
