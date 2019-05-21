#!/bin/bash
set -eEx

cd validate-pr
npm install
npm run validate-pr
