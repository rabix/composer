#!/usr/bin/env bash
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../" && pwd )"

cd $BASEDIR

cp $BASEDIR/src/electron/package.json $BASEDIR/dist/package.json
cp $BASEDIR/src/electron/main.prod.js $BASEDIR/dist/main.js
cp -r $BASEDIR/src/electron/src $BASEDIR/dist
cp -r $BASEDIR/src/electron/node_modules $BASEDIR/dist

$BASEDIR/node_modules/.bin/electron-packager $BASEDIR/dist "rabix-editor" --overwrite --out build --icon $BASEDIR/src/electron/rabix-icon.icns --build-version "0.1.0"
