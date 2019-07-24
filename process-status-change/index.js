// Import 3rd-party libraries.
const _ = require('lodash');
const request = require('request');
const async = require('async');

// Get the SLACK_TOKEN secret from the environment.
const SLACK_TOKEN = _.get(process.env, 'SLACK_TOKEN');

// Get the SLACK_IDS_URL secret from the environment.
const SLACK_IDS_URL = _.get(process.env, 'SLACK_IDS_URL');

// Determine which status events to actually process.
const ALLOWED_CONTEXTS = {
    semaphoreci: 'Semaphore'
};

// Get the event data and context.
const eventPath = process.env.GITHUB_EVENT_PATH;
const eventJson = require(eventPath);
const context = _.get(eventJson, 'context');

// Bail if this is not a context we care about.
if (!ALLOWED_CONTEXTS[context]) {
    process.exit(78);
}

// Get the new PR status.
const state = _.get(eventJson, 'state');

// Bail with a neutral exit code if it's "pending", meaning a test is running.
if (state === 'pending') {
    process.exit(78);
}

// Get more info about the event.
const githubUser = _.get(eventJson, 'commit.committer.login');
const branchName = _.get(eventJson, 'branches.0.name');
const targetUrl = _.get(eventJson, 'target_url');
const repoName = process.env.GITHUB_REPOSITORY.replace(/^olono\//, '');

// Get a description of the build status (lump "error" in with "failure").
const ciStatus = state === 'success' ? 'passed' : 'failed';

async.autoInject(
    {
        slackId: cb => {
            request.get(SLACK_IDS_URL, (err, response, body) => {
                if (err) {
                    return cb(`Got error trying to load Slack IDs: ${err}`);
                }
                try {
                    const slackIds = JSON.parse(body);
                    return cb(null, _.get(slackIds, githubUser));
                } catch (e) {
                    return cb(`Got error trying to parse Slack IDs: ${e}`);
                }
            });
        },
        channel: (slackId, cb) => {
            if (!slackId) {
                return cb('NO_SLACK_ID');
            }
            // Open an IM channel for the user.
            request.post(
                {
                    url: 'https://slack.com/api/im.open',
                    headers: {
                        Authorization: `Bearer ${SLACK_TOKEN}`,
                        'Content-type': 'application/json'
                    },
                    json: {
                        user: slackId,
                        return_im: true
                    }
                },
                (err, response, body) => {
                    if (err) {
                        return cb(`Got error from Slack API when trying to open IM channel: ${err}`);
                    }
                    if (!_.get(body, 'ok')) {
                        return cb(`Got unexpected response from Slack API: ${body}`);
                    }
                    const channel = _.get(body, 'channel.id');
                    return cb(null, channel);
                }
            );
        },
        postMessage: (channel, cb) => {
            // Pick an icon randomly.
            const icon_emoji = _.sample([':male_mage:', ':female_mage:']);

            // Build the Slack message payload.
            const payload = {
                channel,
                text: `Build ${ciStatus}: ${repoName}`,
                blocks: [
                    {
                        type: 'context',
                        elements: [
                            {
                                type: 'mrkdwn',
                                text: `*Repo:* ${repoName}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Status:* ${state}` // <-- this can be "success", "failure" or "error"
                            }
                        ]
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `${state === 'success' ? ':white_check_mark:' : ':x:'}  The <${targetUrl}|${
                                ALLOWED_CONTEXTS[context]
                            } build> of your branch *${branchName}* in the *${repoName}* repo was a ${state}.`
                        }
                    }
                ],
                as_user: false,
                username: 'CI Run Status',
                icon_emoji
            };

            // Post the Slack message.
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
                        return cb(`Got error from Slack API when trying to send message: ${err}`);
                    }
                    if (!_.get(body, 'ok')) {
                        return cb(`Got unexpected response from Slack API: ${body}`);
                    }
                    console.log(`Sent message!`);
                    cb();
                }
            );
        }
    },
    err => {
        if (err) {
            if (err === 'NO_SLACK_ID') {
                console.log(`No slack ID found for Github user ${githubUser}`);
                process.exit(78);
            }
            console.log('An error occured: ', err);
            process.exit(1);
        }
        process.exit(0);
    }
);
