'use strict';

// always import danger first
const { fail, danger } = require('danger');

// danger-plugin-jira-issue exports a default function to hacking to get it imported
const jiraIssue = require('danger-plugin-jira-issue').default;
const _ = require('lodash');

const pr = _.get(danger, 'github.pr');

if (!_.startsWith(_.get(pr, 'title'), 'ISSUE-')) {
    fail('It works!  But PR title must start with a JIRA issue number "ISSUE-XXX"');
}

if (pr) {
    jiraIssue({
        key: 'ISSUE',
        url: 'https://nexdio.atlassian.net/browse',
        location: 'title',
        format: (emoji, jiraUrls) => {
            return _.size(jiraUrls) === 1
                ? `${emoji} JIRA ticket: ${jiraUrls[0]}`
                : `${emoji} JIRA tickets:<br>- ${jiraUrls.join('<br>- ')}`;
        }
    });
}
