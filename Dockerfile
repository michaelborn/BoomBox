## This dockerfile uses Alpine linux cuz it's small,
##   and alpine-node because it includes Node.JS.
FROM mhart/alpine-node:base
#FROM alpine:3.3

## Settings, like workdir
# create environment variable/flag


### Add git to package list
### Add Node.js to package list (Note we don't need npm, since the modules are included in the image.)
### Add Mongo DB to package list
RUN apk add git mongodb-server fpcalc



### Setup SSH keys for git (how will this even work?)

### cloning repo
RUN mkdir /var/www
RUN sudo chmod a+w www/
RUN git clone https://github.com/mborn319/BoomBox.git /var/www

## Expose the Node.JS server port
EXPOSE 8080

## Run command to start the server and keep it running so we can access the audio track list
