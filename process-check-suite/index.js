const _ = require('lodash');

const ALLOWED_CONTEXTS = {
    semaphoreci: 'Semaphore'
};

const eventPath = process.env.GITHUB_EVENT_PATH;
const eventJson = require(eventPath);

if (!ALLOWED_CONTEXTS[_.get(eventJson, 'context')]) {
    process.exit(78);
}

const status = _.get(eventJson, 'status');
if (status === 'pending') {
    process.exit(78);
}

if (status === 'failed') {
    console.log('FAIL!');
}

if (status === 'failure') {
    console.log('FAIL!');
}

if (status === 'error') {
    console.log('ERROR!');
}

console.dir({ env: process.env, json: eventJson }, { depth: null });
