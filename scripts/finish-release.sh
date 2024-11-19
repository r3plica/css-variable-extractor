#!/bin/bash

version=$(jq -r '.version' package.json)

if [ -z "$version" ]; then
  echo "Version not found in package.json!"
  exit 1
fi

latest_release=$(git branch -r | grep 'origin/release/' | sort -V | tail -n 1 | sed 's/origin\///')

if [ -z "$latest_release" ]; then
  echo "No release branch found!"
  exit 1
fi

git flow release finish "$latest_release" --message "Release $version"
if [ $? -ne 0 ]; then
  echo "Failed to finish release '$latest_release'."
  exit 1
fi

git push origin master --tags

echo "Release '$latest_release' finished and pushed successfully!"
exit 0
