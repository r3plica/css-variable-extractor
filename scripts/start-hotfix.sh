#!/bin/bash

name=$1
if [ -z "$name" ]; then
  echo "Please provide a hotfix name."
  exit 1
fi

git flow hotfix start "$name"

echo "Hotfix $name started!"
