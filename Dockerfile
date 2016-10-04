# This dockerfile uses Alpine linux cuz it's small,
#   and alpine-node because it includes Node.JS.
FROM mhart/alpine-node:base
#FROM alpine:3.3

# Settings, like workdir
# create environment variable/flag
WORKDIR /var/www

## We need to do this first?
RUN apt-get update


# Different things we need for development / use
RUN apt-get install -y \
    libchromaprint-tools \
    python \
    python-dev \
    python-distribute \
    python-libdiscid\
    python-pip
RUN apk add \
    git \
    mongodb-server

# install python dependencies
RUN pip install \
    


# Setup SSH keys for git (how will this even work?)

# cloning repo
RUN mkdir /var/www
RUN chmod a+w www/
RUN git clone https://github.com/mborn319/BoomBox.git /var/www

# Expose the Node.JS server port
EXPOSE 8080

# Run command to start the server and keep it running so we can access the audio track list
CMD["node","index.js"]
