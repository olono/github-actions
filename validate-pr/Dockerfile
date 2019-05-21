FROM node:10

LABEL "com.github.actions.name"="Validate PR"
LABEL "com.github.actions.description"="Run Danger PR validation"
LABEL "com.github.actions.icon"="pencil"
LABEL "com.github.actions.color"="purple"

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]