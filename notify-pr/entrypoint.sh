#!/bin/bash
set -eEx

cd /_github-actions/notify-pr
npm install
npm run notify-pr
