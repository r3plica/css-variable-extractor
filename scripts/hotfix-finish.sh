#!/bin/bash

latest_hotfix=$(git branch -r | grep 'origin/hotfix/' | sort -V | tail -n 1)

if [ -z "$latest_hotfix" ]; then
  echo "No hotfix branches found!"
  exit 1
fi

hotfix_name=$(echo "$latest_hotfix" | sed 's|origin/hotfix/||' | xargs)

echo "Running standard-version to bump version and update changelog..."
npx standard-version --release-as patch

hotfix_version=$(grep -oP '"version": "\K[0-9\.]+' package.json)

git flow hotfix finish "$hotfix_name" -m "Hotfix $hotfix_version"

git push --follow-tags

git push origin --delete "hotfix/$hotfix_name"
git branch -d "hotfix/$hotfix_name"

echo "Hotfix '$hotfix_name' finished, pushed, and remote branch deleted!"
exit 0