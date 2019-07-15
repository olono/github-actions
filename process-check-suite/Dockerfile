FROM node:10

LABEL "com.github.actions.name"="Process Check Suite"
LABEL "com.github.actions.description"="Process a Github Check Suite Event"
LABEL "com.github.actions.icon"="pencil"
LABEL "com.github.actions.color"="purple"

COPY . /_github-actions/process-check-suite/

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]