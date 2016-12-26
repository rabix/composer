#!/usr/bin/env bash
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../" && pwd )"

cd $BASEDIR

./node_modules/.bin/electron ./electron
