#!/bin/bash

source ./utils.sh

# Check if on the correct branch
check_out_branch "develop"

# Check if feature name is provided as an argument
name=$1
if [ -z "$name" ]; then
  echo "Please provide a feature name."
  exit 1
fi

# Check if git flow is initialized
if ! git flow 2>&1 | grep -q 'No current branch'; then
  echo "Git flow is not initialized. Please initialize it before running the script."
  exit 1
fi

# Start the feature branch using git flow
git flow feature start "$name" || { echo "Failed to start feature '$name'"; exit 1; }

# Push the feature branch to remote
git push origin "feature/$name" || { echo "Failed to push feature branch '$name' to remote"; exit 1; }

echo "Feature '$name' started and pushed to origin successfully!"
exit 0
