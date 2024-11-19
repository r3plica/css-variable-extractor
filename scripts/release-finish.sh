#!/bin/bash

version=$(grep -oP '"version": "\K[0-9\.]+' package.json)

if [ -z "$version" ]; then
  echo "Version not found in package.json!"
  exit 1
fi

latest_release=$(git branch -r | grep 'origin/release/' | sort -V | tail -n 1)

if [ -z "$latest_release" ]; then
  echo "No release branches found!"
  exit 1
fi

release_name=$(echo "$latest_release" | sed 's|origin/release/||' | xargs)

echo "Finishing release branch: $release_name"
git flow release finish "$release_name" --message "Release $version"
if [ $? -ne 0 ]; then
  echo "Failed to finish release '$release_name'."
  exit 1
fi

echo "Pushing updates to master and tags..."
git push origin master --tags --force

echo "Deleting release branch locally and on origin..."
git push origin --delete "release/$release_name"
git branch -d "release/$release_name"

echo "Release '$release_name' finished, pushed, and cleaned up successfully!"

exit 0
