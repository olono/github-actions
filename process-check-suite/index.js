const _ = require('lodash');
const request = require('request');

const SLACK_IDS = require('./slack-ids');
const SLACK_TOKEN = _.get(process.env, 'SLACK_TOKEN');

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
const repoName = process.env.GITHUB_REPOSITORY.replace(/^olono\//, '');
const targetUrl = _.get(eventJson, 'target_url');
const ciStatus = state === 'success' ? 'passed' : 'failed';

if (slackInfo) {
    const slackChannel = slackInfo.channel || slackInfo.id;
    const icon_emoji = _.sample([':male_mage:', ':female_mage:']);
    const payload = {
        channel: slackChannel,
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
                        text: `*Status:* ${ciStatus}`
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
