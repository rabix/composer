#!/usr/bin/env bash
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../" && pwd )"

cd $BASEDIR

cp ./electron/package.prod.json ./dist/package.json
cp ./electron/main.prod.js ./dist/main.js
cp -r ./electron/src ./dist/

./node_modules/.bin/electron-packager ./dist "rabix-editor-$(date +%s)" --overwrite --out build --icon ./electron/rabix-icon.icns --build-version "0.1.0"