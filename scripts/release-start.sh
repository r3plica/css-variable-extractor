#!/bin/bash

echo "Running standard-version to bump version and update changelog..."
npx standard-version

new_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)

if [ -z "$new_version" ]; then
  echo "Failed to bump the version with standard-version!"
  exit 1
fi

echo "Starting new release branch: $new_version"
git flow release start "$new_version"

echo "Release branch $new_version started"

exit 0
