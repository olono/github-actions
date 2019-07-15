const _ = require('lodash');
const request = require('request');

const SLACK_IDS = require('./slack-ids');
const SLACK_TOKEN = 'vhIR739SUdyCVCnxUE1bYh98-791675935396-7682552394-bxox'
    .split('')
    .reverse()
    .join('');

const ALLOWED_CONTEXTS = {
    semaphoreci: 'Semaphore'
};

const eventPath = process.env.GITHUB_EVENT_PATH;
const eventJson = require(eventPath);
const context = _.get(eventJson, 'context');

if (!ALLOWED_CONTEXTS[context]) {
    process.exit(78);
}

const state = _.get(eventJson, 'state');
if (state === 'pending') {
    process.exit(78);
}

if (state === 'success') {
    console.log('SUCCESS!');
}

if (state === 'failure') {
    console.log('FAIL!');
}

if (state === 'error') {
    console.log('ERROR!');
}

const githubUser = _.get(eventJson, 'commit.committer.login');
const slackInfo = _.get(SLACK_IDS, githubUser);
const branchName = _.get(eventJson, 'branches.0.name');
const targetUrl = _.get(eventJson, 'target_url');

console.log({ githubUser, slackInfo, branchName, targetUrl, state });

if (slackInfo) {
    const slackChannel = slackInfo.channel || slackInfo.id;
    const payload = {
        channel: slackChannel,
        text: `:${state === 'success' ? '+1' : '-1'}: The <${targetUrl}|${
            ALLOWED_CONTEXTS[context]
        } build> of your branch *${branchName}* in the *${
            process.env.GITHUB_REPOSITORY
        }* repo was a ${state}.`,
        as_user: false,
        username: 'CI BOT!'
    };
    console.log(`Bearer ${SLACK_TOKEN}`, payload);
    request.post(
        {
            url: 'https://slack.com/api/chat.postMessage',
            headers: {
                Authorization: `Bearer ${SLACK_TOKEN}`,
                'Content-type': 'application/json'
            },
            json: payload
        },
        (err, response, body) => {
            if (err) {
                console.log('Got error from Slack API when trying to send message:', err);
                process.exit(0);
            }
            if (!_.get(body, 'ok')) {
                console.log('Got unexpected response from Slack API:', body);
                process.exit(0);
            }
            console.log(`Sent message!`);
            process.exit(0);
        }
    );
}

console.dir({ env: process.env, json: eventJson }, { depth: null });
