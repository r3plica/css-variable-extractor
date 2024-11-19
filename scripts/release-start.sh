#!/bin/bash

echo "Running standard-version to bump version and update changelog..."
npx standard-version

new_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)

if [ -z "$new_version" ]; then
  echo "Failed to bump the version with standard-version!"
  exit 1
fi

release_branch="release/$new_version"
echo "Starting new release branch: $release_branch"
git flow release start "$release_branch"

git rev-parse --verify "$release_branch" > /dev/null
if [ $? -ne 0 ]; then
  echo "Failed to create release branch!"
  exit 1
fi

echo "Release branch $release_branch started with version $new_version"

exit 0
