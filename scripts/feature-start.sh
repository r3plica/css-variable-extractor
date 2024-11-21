#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source utils.sh from the script's directory
source "$SCRIPT_DIR/utils.sh"

# Check if on the correct branch
check_out_branch "develop"

# Check if feature name is provided as an argument
name=$1
if [ -z "$name" ]; then
  echo "Please provide a feature name."
  exit 1
fi

# Start the feature branch using git flow
git flow feature start "$name" || { echo "Failed to start feature '$name'"; exit 1; }

# Push the feature branch to remote
git push origin "feature/$name" || { echo "Failed to push feature branch '$name' to remote"; exit 1; }

echo "Feature '$name' started and pushed to origin successfully!"
exit 0
