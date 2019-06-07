'use strict';

const { WebClient } = require('@slack/web-api');
const _ = require('lodash');
const event = require(process.env.GITHUB_EVENT_PATH);

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;

const web = new WebClient(token);

(async () => {
    // See: https://api.slack.com/methods/chat.postMessage
    // change channel to userid?
    const res = await web.chat.postMessage({
        channel: '#pr-mentions',
        text: `ay ${JSON.stringify({
            path: process.env.GITHUB_EVENT_PATH,
            event: event.action,
            comment: _.get(event, 'comment.body'),
            reviewComment: _.get(event, 'review.body'),
            sender: _.get(event, 'sender.login'),
            prAuthor: _.get(event, 'pull_request.user.login')
        })}`
    });
})();
