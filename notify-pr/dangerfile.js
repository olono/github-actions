'use strict';

// always import danger first
const { danger } = require('danger');
const { WebClient } = require('@slack/web-api');
const _ = require('lodash');

const pr = _.get(danger, 'github.pr');

if (pr) {
    // An access token (from your Slack app or custom integration - xoxp, xoxb)
    const token = process.env.SLACK_TOKEN;

    const web = new WebClient(token);

    (async () => {
        // See: https://api.slack.com/methods/chat.postMessage
        // change channel to userid?
        const res = await web.chat.postMessage({ channel: '#pr-mentions', text: `ay ${JSON.stringify(process.env.GITHUB_EVENT_PATH)}` });
    })();
}
