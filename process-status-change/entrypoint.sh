#!/bin/bash
set -eEx

cd /_github-actions/process-status-change
npm install
npm run start
