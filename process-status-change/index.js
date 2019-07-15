// Import 3rd-party libraries.
const _ = require('lodash');
const request = require('request');

// Import constants.
const SLACK_IDS = require('./slack-ids');

// Get the SLACK_TOKEN secret from the environment.
const SLACK_TOKEN = _.get(process.env, 'SLACK_TOKEN');

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

// Get the committer's slack info.
const slackId = _.get(SLACK_IDS, githubUser);

// If we found some, try to send a slack message.
if (slackId) {
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
                console.log('Got error from Slack API when trying to open IM channel:', err);
                process.exit(1);
            }
            if (!_.get(body, 'ok')) {
                console.log('Got unexpected response from Slack API:', body);
                process.exit(1);
            }
            const channel = _.get(body, 'channel.id');

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
                        console.log('Got error from Slack API when trying to send message:', err);
                        process.exit(1);
                    }
                    if (!_.get(body, 'ok')) {
                        console.log('Got unexpected response from Slack API:', body);
                        process.exit(1);
                    }
                    console.log(`Sent message!`);
                    process.exit(0);
                }
            );
        }
    );
}
