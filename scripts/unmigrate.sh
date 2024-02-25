#!/bin/bash

# Run the migrations
source ./scripts/popenv.sh
migrate -database ${POSTGRES_CONNECTION_STRING} -path migrations down
