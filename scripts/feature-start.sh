#!/bin/bash

name=$1
if [ -z "$name" ]; then
  echo "Please provide a feature name."
  exit 1
fi

git flow feature start "$name"

git push origin "$name"

echo "Feature $name started and pushed to develop!"
