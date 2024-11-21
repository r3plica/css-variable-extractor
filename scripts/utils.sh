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
  local branch_name=${1:-master}
  local bump_type=${2:-patch}  # Accept a bump type (patch, minor, major)
  local old_version new_version

  # Check if package.json exists
  if [ ! -f "package.json" ]; then
    echo "Error: package.json not found!"
    exit 1
  fi

  # Extract the current version from package.json
  old_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)

  # Function to increment version (patch, minor, major)
  increment_version() {
    local version=$1
    local type=$2
    IFS='.' read -r major minor patch <<< "$version"

    case "$type" in
      major) echo "$((major+1)).0.0" ;;
      minor) echo "$major.$((minor+1)).0" ;;
      patch) echo "$major.$minor.$((patch+1))" ;;
      *) echo "$version" ;;
    esac
  }

  # Increment the version based on the bump type (patch, minor, major)
  new_version=$(increment_version "$old_version" "$bump_type")

  # Update the version in package.json using sed
  sed -i "s/\"version\": \"$old_version\"/\"version\": \"$new_version\"/" package.json

  # Verify the version was updated
  new_version_check=$(grep -oP '"version": "\K[0-9\.]+' package.json)

  if [ "$old_version" == "$new_version_check" ]; then
    echo "Error: Version update failed!"
    exit 1
  fi

  # Return the new version
  echo "$new_version"
}



