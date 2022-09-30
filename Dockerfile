FROM node:16

USER root

# Bundle app source
WORKDIR /apps/node/twitter-breakup-bot
COPY . .

# Install app dependencies
RUN npm install
RUN npm update

ENTRYPOINT [ "node", "breakup.js" ]

