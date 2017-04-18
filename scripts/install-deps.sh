#!/usr/bin/env bash

MANAGER="npm";

if hash yarn 2>/dev/null; then
    MANAGER="yarn"
fi

"$MANAGER" install

cd electron
"$MANAGER" install