#!/bin/bash

set -e

docker-compose -f docker-compose.yml down

searchPattern="dev-peer[09].org[09]"

containers=$( docker ps -a | grep "$searchPattern"  | awk '{print $1}' )
if [[ -n $containers ]]; then
    echo "REMOVING DOCKER CONTAINERS"
    docker rm $containers
    echo ""
fi

images=$( docker images -a | grep "$searchPattern"  | awk '{print $3}' )
if [[ -n $images ]]; then
    echo "REMOVING DOCKER IMAGES"
    docker rmi $images 
    echo ""
fi

