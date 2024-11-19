#!/bin/bash

latest_hotfix=$(git branch -r | grep 'origin/hotfix/' | sort -V | tail -n 1)

if [ -z "$latest_hotfix" ]; then
  echo "No hotfix branches found!"
  exit 1
fi

echo "Running standard-version to bump version and update changelog..."
npx standard-version --release-as patch

hotfix_version=$(jq -r '.version' package.json)

git flow hotfix finish "$latest_hotfix" -m "Hotfix $hotfix_version"
git push --follow-tags

echo "Hotfix $latest_hotfix finished and pushed!"
exit 0
