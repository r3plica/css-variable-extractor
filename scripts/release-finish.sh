#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source utils.sh from the script's directory
source "$SCRIPT_DIR/utils.sh"

# Find the latest release branch
latest_release=$(git branch -r | grep 'origin/release/' | sort -V | tail -n 1)

if [ -z "$latest_release" ]; then
  echo "No release branches found!"
  exit 1
fi

# Extract the release name from the branch
release_name=$(echo "$latest_release" | sed 's|origin/release/||' | xargs)

# Check if on the correct branch
check_out_branch "release/$release_name"

# Get the version from package.json
version=$(grep -oP '"version": "\K[0-9\.]+' package.json)

if [ -z "$version" ]; then
  echo "Error: Version not found in package.json!"
  exit 1
fi

echo "Finishing release branch: $release_name"
# Finish the release with git flow
git flow release finish "$release_name" --message "Release $version" || { echo "Error: Failed to finish release '$release_name'"; exit 1; }

# Push changes to remote
echo "Pushing updates to master and develop branches along with tags..."
git push origin master --tags || { echo "Error: Failed to push to master"; exit 1; }
git push origin develop --tags || { echo "Error: Failed to push to develop"; exit 1; }

# Delete the remote branch
delete_branch "$latest_release"

echo "Release '$release_name' finished, pushed, and cleaned up successfully!"

exit 0
