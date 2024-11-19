#!/bin/bash

git checkout develop
git pull

name=$1
if [ -z "$name" ]; then
  echo "Please provide a feature name."
  exit 1
fi

git flow feature start "$name"

echo "Feature $name started!"
