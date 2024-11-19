#!/bin/bash

version=$(jq -r '.version' package.json)

if [ -z "$version" ]; then
  echo "Version not found in package.json!"
  exit 1
fi

latest_release=$(git branch -r | grep 'origin/release/' | sort -V | tail -n 1)

if [ -z "$latest_release" ]; then
  echo "No release branches found!"
  exit 1
fi

release_name=${latest_release#origin/release/}

git flow release finish "$release_name" --message "Release $version"
if [ $? -ne 0 ]; then
  echo "Failed to finish release '$release_name'."
  exit 1
fi

git push origin master --tags

echo "Release '$release_name' finished and pushed successfully!"
exit 0
