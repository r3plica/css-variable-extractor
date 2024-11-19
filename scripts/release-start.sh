#!/bin/bash

echo "Running version control to bump version and update changelog..."
git checkout develop
git pull

old_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)
echo "Current version: $old_version"

npx release-it

new_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)
echo "New version: $new_version"

if [ "$old_version" == "$new_version" ]; then
  echo "Error: release-it did not update package.json version!"
  exit 1
fi

git log | head

git stash

echo "Starting new release branch: $new_version"
git flow release start "$new_version"

while ! git show-ref --verify --quiet refs/heads/release/"$new_version"; do
  echo "Waiting for release branch $new_version to be created..."
  sleep 1
done

echo "about to apply the stash"
git diff

git stash apply
git add .
git commit -m "Bump version to $new_version"

git push origin "release/$new_version"

echo "Release branch $new_version started and pushed to origin!"

exit 0
