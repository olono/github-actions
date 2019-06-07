FROM node:10

LABEL "com.github.actions.name"="Notify PR"
LABEL "com.github.actions.description"="Run Danger PR notification"
LABEL "com.github.actions.icon"="pencil"
LABEL "com.github.actions.color"="purple"

COPY . /_github-actions/notify-pr/

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]