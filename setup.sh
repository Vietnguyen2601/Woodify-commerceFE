#!/usr/bin/env bash
set -e
echo "Creating project folder 'wood-marketplace'..."
mkdir -p wood-marketplace
cp -r ./* wood-marketplace/
echo "Run 'cd wood-marketplace' then 'npm install' to install dependencies."
