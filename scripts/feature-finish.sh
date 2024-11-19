#!/bin/bash

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ ! "$current_branch" =~ ^feature/ ]]; then
  echo "You must be on a feature branch to run this script. Current branch: $current_branch"
  exit 1
fi

feature_name=${current_branch#feature/}

git flow feature finish "$feature_name"
if [ $? -ne 0 ]; then
  echo "Failed to finish feature '$current_branch'."
  exit 1
fi

git push origin develop --tags

git push origin --delete "$current_branch"
git branch -d "$current_branch"

echo "Feature '$current_branch' finished, merged into develop, and remote branch deleted."
