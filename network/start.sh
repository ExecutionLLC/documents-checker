#!/bin/bash

set -e

./stop.sh
echo "STARTING DOCKER CONTAINERS"
docker-compose -f docker-compose.yml start

