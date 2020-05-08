FROM node:current-alpine

RUN apk add curl

COPY dist/server.js /

CMD node /server.js
EXPOSE 28080/tcp
