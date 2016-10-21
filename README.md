# BoomBox
Use a raspberry pi or any computer as a media server for audio files.

## Dependencies
* Node.js
* npm
* Grunt.js

## Installation
* Install node and npm. `sudo apt-get install nodejs npm`
* Install Mongo. `sudo apt-get install mongodb`
* Install package dependencies. `npm install`
* Install grunt. `sudo npm install -g grunt-cli`
* Run grunt to compile frontend scripts, etc. `grunt`

## Usage
* First, rip a CD by placing it in the CD drive and running `ripdisc.js`, found in the `organize` folder.
* Repeat as necessary for each CD.
* Add `boombox.localhost` to your /etc/hosts file
* Start Boombox: `node index.js`
* Visit the Boombox homepage: `http://localhost:8080`

## API docs
API documentation is generated thanks to [API Blueprint](https://apiblueprint.org/) and [Apiary](https://apiary.io/). [View API documentation](http://docs.boombox.apiary.io).
