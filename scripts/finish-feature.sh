#!/bin/bash

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ ! "$current_branch" =~ ^feature/ ]]; then
  echo "You must be on a feature branch to run this script. Current branch: $current_branch"
  exit 1
fi

git flow feature finish "$current_branch"
if [ $? -ne 0 ]; then
  echo "Failed to finish feature '$current_branch'."
  exit 1
fi

git push origin develop --tags

echo "Feature '$current_branch' finished and merged into develop."
