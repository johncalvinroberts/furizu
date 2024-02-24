#!/bin/bash

# Load .env file and export its variables
while IFS='=' read -r key value
do
  # Skip empty lines and lines starting with #
  if [[ ! $key || $key == \#* ]]; then
    continue
  fi
  # Use eval to properly handle variables that include spaces
  eval export $key='$value'
done < .env

echo $POSTGRES_CONNECTION_STRING
