#!/bin/bash

# hate that i have to do this, but the gh action pnpm/action-setup@v2 alters pnpm-lock.yaml
git checkout ui/pnpm-lock.yaml

if [ -n "$(git status --porcelain)" ]; then
  echo "Git status is not clean after installing and linting. Please double check lockfiles and your code formatting.";
  git status
  exit 1;
else
  echo "No changes detected. You r gud.";
fi
