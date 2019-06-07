'use strict';

// always import danger first
const { danger } = require('danger');

const slack = require('danger-plugin-slack');
const _ = require('lodash');

const pr = _.get(danger, 'github.pr');

if (pr) {
    const options = {
        webhookUrl: 'https://hooks.slack.com/services/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', // TODO CHANGE TO ENV
        text: 'Hello world!', // A custom message to send instead of the report (optional, default: null)
        username: 'pr-boi',
        iconEmoji: ':sunglasses:'
    };

    slack(options);
}
