#!/usr/bin/env node
var Player = require("player"),
    player = new Player();

function Playlist() {
  var ret = {
    paused: false,
    current: -1,
    list: new Array(0),
    add: function(track) {
      var serverRoot = "/var/www/Server/boombox/www/";
      console.log("Adding track to playlist:",track.title);
      this.list.push(track);
      player.add(serverRoot + track.filename);
    },
    remove: function(track) {
      var delNum = function(listTrack) {
        if (listTrack._id === track._id) {
          console.log("removing track from playlist:",listTrack.filename);
        }
        return listTrack._id === track._id;
      };
      this.list.splice(delNum,1);
    },
    prev: function() {
      // since node-player doesn't support this,
      // I'll either have to submit a pull request
      // or write my own implementation right here.
      // https://github.com/guo-yu/player
      
    },
    next: function() {
      /**
       * this function will advance the audio stream to the next song
       * unless no next song exists in the .list[] array.
       */
      player.next();
    },
    pause: function() {
      /**
       * this function will pause the audio stream if current playing
       * OR will resume the audio stream if paused and a song is loaded.
       */
      this.paused = true;
      player.pause();
    },
    resume: function() {
      this.paused = false;

    },
    play: function() {
      /**
       * this function will start the audio stream.
       * If currently playing, it will first stop the current song,
       * clear the playlist, 
       * then start the new song.
       */
      var self = this;
      self.paused = false;
      player.play(function(err, player) {
        self.paused = true;
        console.log("End of playback!",arguments);
        //res.json({"error":false,"playing":false});
      });
    },
    stop: function() {
      /**
       * this function stops the currently playing stream
       */
      this.paused = true;
      player.stop();
    }
  };
  return ret;
};
module.exports = new Playlist();
