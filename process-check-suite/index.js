const _ = require('lodash');
const request = require('request');

const SLACK_IDS = require('../shared/slack-ids');
const SLACK_TOKEN = 'xoxb-4932552867-693539576197-buemNUZ9Y22NyF8HmZ5HodbF';

const ALLOWED_CONTEXTS = {
    semaphoreci: 'Semaphore'
};

const eventPath = process.env.GITHUB_EVENT_PATH;
const eventJson = require(eventPath);
const context = _.get(eventJson, 'context');

if (!ALLOWED_CONTEXTS[context]) {
    process.exit(78);
}

const status = _.get(eventJson, 'status');
if (status === 'pending') {
    process.exit(78);
}

if (status === 'success') {
    console.log('SUCCESS!');
}

if (status === 'failure') {
    console.log('FAIL!');
}

if (status === 'error') {
    console.log('ERROR!');
}

const githubUser = _.get(eventJson, 'committer.login');
const slackInfo = _.get(SLACK_IDS, githubUser);
const branchName = _.get(eventJson, 'branches.0.name');
const targetUrl = _.get(eventJson, 'target_url');

if (slackInfo) {
    const slackChannel = slackInfo.channel || slackInfo.id;
    const payload = {
        channel: slackChannel,
        text: `:${status === 'success' ? '+1' : '-1'}: The <${targetUrl}|${
            ALLOWED_CONTEXTS[context]
        } build> of your branch *${branchName}* in the *${
            process.env.GITHUB_REPOSITORY
        }* repo was a ${status}.`,
        as_user: false,
        username: 'CI BOT!'
    };
    request.post(
        {
            url: 'https://slack.com/api/chat.postMessage',
            headers: {
                Authorization: `Bearer ${SLACK_TOKEN}`
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
