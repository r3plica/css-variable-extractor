#!/bin/bash

source ./utils.sh

# Check if on the correct branch
check_out_branch "develop"

# update version
new_version=$(update_version)

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
