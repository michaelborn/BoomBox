# This dockerfile uses Alpine linux cuz it's small,
#   and alpine-node because it includes Node.JS.
FROM mhart/alpine-node:base
#FROM alpine:3.3

# Settings, like workdir
# create environment variable/flag
WORKDIR /var/www

## We need to do this first?
RUN apk update && apk upgrade


# Different things we need for development / use
#RUN apk add libchromaprint-tools
RUN apk add git
RUN apk add mongodb-server



# Setup SSH keys for git (how will this even work?)

# cloning repo
RUN mkdir /var/www
RUN chmod a+w www/
RUN git clone https://github.com/mborn319/BoomBox.git /var/www

# Expose the Node.JS server port
EXPOSE 8080

# Run command to start the server and keep it running so we can access the audio track list
CMD["node","index.js"]
