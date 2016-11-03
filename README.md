# BoomBox
Use a raspberry pi or any computer as a media server for audio files.

## Dependencies
* Node.js
* npm
* cdparanoia, a CD ripper binary

## Installation
* Clone Boombox - `git clone https://github.com/mborn319/BoomBox.git`
* Install node and npm - `sudo apt-get install nodejs nodejs-legacy npm`
* Install Mongo - `sudo apt-get install mongodb`
* Install package dependencies - `npm install`
* Install grunt - `sudo npm install -g grunt-cli`
* Run grunt to compile frontend scripts, etc - `grunt`

## Usage

### Copying Audio Files to Boombox
* Place an audio CD in the CD drive
* Navigate to boombox/organize. `cd organize`
* Begin the CD rip process with `node ripdisc.js`
* Repeat as necessary for each CD.

### Start up the web server
* Add `boombox.localhost` to your /etc/hosts file
* Start Boombox: `node index.js`
* Visit the Boombox homepage: `http://localhost:8080`

## API docs
API documentation is generated thanks to [API Blueprint](https://apiblueprint.org/) and [Apiary](https://apiary.io/). [View API documentation](http://docs.boombox.apiary.io).
