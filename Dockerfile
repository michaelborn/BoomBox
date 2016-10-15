# This dockerfile uses Alpine linux cuz it's small,
#   and alpine-node because it includes Node.JS.
FROM mhart/alpine-node:base
#FROM alpine:3.3

# Settings, like workdir
# create environment variable/flag
WORKDIR /var/www

# copy current source to the WORKDIR
ADD . .

## We need to do this first?
RUN apk update && apk upgrade


# Different things we need for development / use
RUN apk search -v mongo
RUN apk add \
    python \
    python-pip \
    git
    #mongodb-server

# install python dependencies
RUN pip install python-libdiscid
    
## Expose the Node.JS server port
EXPOSE 8080

## install the node modules
RUN npm install

## make git pull in all submodules within the project
RUN git submodule init

## Run command to start the server and keep it running so we can access the audio track list
CMD["node","index.js"]
