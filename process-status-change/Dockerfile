FROM node:10

LABEL "com.github.actions.name"="Process Status Change"
LABEL "com.github.actions.description"="Process a Github Status Change Event"
LABEL "com.github.actions.icon"="pencil"
LABEL "com.github.actions.color"="purple"

COPY . /_github-actions/process-status-change/

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]