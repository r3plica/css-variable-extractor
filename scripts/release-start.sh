#!/bin/bash

echo "Running version control to bump version and update changelog..."
git checkout master
git pull
npx release-it

new_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)
if [ -z "$new_version" ]; then
  echo "Failed to bump the version with standard-version!"
  exit 1
fi

git stash
git checkout develop
git pull

echo "Starting new release branch: $new_version"
git flow release start "$new_version"

git stash apply
git add .
git commit -m "Bump version to $new_version"

git push origin "release/$new_version"

echo "Release branch $new_version started and pushed to origin!"

exit 0
