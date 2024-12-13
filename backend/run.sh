#!/bin/bash

# Check if nodemon is installed
if ! command -v nodemon &> /dev/null
then
    echo "nodemon is not installed. Install it with 'sudo npm install -g nodemon'."
    exit 1
fi

# Run nodemon with configuration to watch .go files and execute main.go
nodemon --watch './**/*.go' --signal SIGTERM --exec "go run" main.go
