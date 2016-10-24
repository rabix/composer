# Cottontail (Rabix Editor) Guide

## Installation

```bash
git clone https://github.com/rabix/cottontail-frontend
cd cottontail-frontend
npm install
```

## Starting the dev environment
```bash
cp config/env.example.json config/env.json # only once, modify if needed
npm run start:electron
./scripts/electron-start.sh
```

## Packaging the build as a desktop app for the host system and architecture
```bash
npm run build:electron
./scripts/electron-build.sh
```

