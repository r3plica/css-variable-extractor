#!/bin/bash

latest_hotfix=$(git branch -r | grep 'origin/hotfix/' | sort -V | tail -n 1)

if [ -z "$latest_hotfix" ]; then
  echo "No hotfix branches found!"
  exit 1
fi

hotfix_name=$(echo "$latest_hotfix" | sed 's|origin/hotfix/||' | xargs)

echo "Running version control to bump version and update changelog..."
git checkout "hotfix/$hotfix_name"
git pull
npx release-it patch

new_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)
if [ -z "$new_version" ]; then
  echo "Failed to bump the version with standard-version!"
  exit 1
fi

git add .
git commit -m "Bump version to $new_version"

git flow hotfix finish "$hotfix_name" -m "Hotfix $new_version"
git push origin master
git push origin develop
git push --follow-tags

git push origin --delete "hotfix/$hotfix_name"
git branch -d "hotfix/$hotfix_name"

echo "Hotfix '$hotfix_name' finished and pushed!"
exit 0
