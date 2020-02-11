FROM node:10

COPY . /_github-actions/validate-pr/

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]