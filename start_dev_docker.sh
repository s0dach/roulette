#!/usr/bin/bash

cd ./deploy/dev-local && \
docker-compose \
    up --build
    # up -d --build