#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source utils.sh from the script's directory
source "$SCRIPT_DIR/utils.sh"

# Get the version type from the command line argument (default to 'patch' if not provided)
version_type=${1:-patch}

# Check if the version type is valid (major, minor, or patch)
if [[ ! "$version_type" =~ ^(major|minor|patch)$ ]]; then
  echo "Invalid version type '$version_type'. Valid options are 'major', 'minor', or 'patch'."
  exit 1
fi

# Check if on the correct branch
check_out_branch "develop"

# Update version (pass the version type to the update_version function)
new_version=$(update_version "$version_type")

git stash || { echo "Failed to stash changes"; exit 1; }

echo "Starting new release branch: $new_version"
git flow release start "$new_version" || { echo "Failed to start release branch"; exit 1; }

# Wait for the release branch to be created
while ! git show-ref --verify --quiet refs/heads/release/"$new_version"; do
  echo "Waiting for release branch $new_version to be created..."
  sleep 1
done

echo "Release branch $new_version created successfully"

# Apply the stash after the branch creation
echo "Applying the stash..."
git stash apply || { echo "Failed to apply stash"; exit 1; }

# Check for unstaged changes after applying stash
git diff || { echo "There are unexpected changes after applying the stash"; exit 1; }

git add . || { echo "Failed to stage changes"; exit 1; }
git commit -m "Bump version to $new_version" || { echo "Failed to commit version bump"; exit 1; }

git push origin "release/$new_version" || { echo "Failed to push release branch"; exit 1; }

echo "Release branch $new_version started and pushed to origin!"

exit 0
