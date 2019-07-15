const eventPath = process.env.GITHUB_EVENT_PATH;

const eventJson = require(eventPath);
console.dir({ env: process.env, json: eventJson }, { depth: null });
