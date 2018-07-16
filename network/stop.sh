#!/bin/bash

set -e

# Shut down the Docker containers that might be currently running.
echo "STOPING DOCKER CONTAINERS"
docker-compose -f docker-compose.yml stop
