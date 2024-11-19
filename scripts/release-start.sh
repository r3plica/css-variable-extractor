#!/bin/bash

echo "Running standard-version to bump version and update changelog..."
npx standard-version

new_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)

if [ -z "$new_version" ]; then
  echo "Failed to bump the version with standard-version!"
  exit 1
fi

echo "Pushing version bump commit to develop..."
git push origin develop --tags

echo "Starting new release branch: $new_version"
git flow release start "$new_version"

git push origin "release/$new_version"

echo "Release branch $new_version started and pushed to origin!"

exit 0
