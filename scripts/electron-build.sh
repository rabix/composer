#!/usr/bin/env bash
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../" && pwd )"

cd $BASEDIR

tsc ./src/electron/*.ts --module amd --outFile ./dist/main.js
cp ./src/electron/package.json ./dist/package.json

./node_modules/.bin/electron-packager ./dist --overwrite --out build