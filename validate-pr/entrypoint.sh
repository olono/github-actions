#!/bin/bash
set -eEx

cd _github-actions/validate-pr
npm install
npm run validate-pr
