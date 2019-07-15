#!/bin/bash
set -eEx

cd /_github-actions/process-check-suite
npm install
npm run start
