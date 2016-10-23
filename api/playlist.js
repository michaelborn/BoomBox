#!/usr/bin/env node
var Player = require("Player"),
    player = new Player();

function Playlist() = {
  var ret = {
    paused: false,
    list: array[],
    add: function(track) {
      list.append(track);
      playlist.add(track.filename);
    },
    remove: function(track) {

    },
    prev: function() {

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
      player.pause();
    },
    resume: function() {

    },
    play: function() {
      /**
       * this function will start the audio stream.
       * If currently playing, it will first stop the current song,
       * clear the playlist, 
       * then start the new song.
       */
      player.play(function(err, player) {
        console.log("End of playback!",arguments);
        //res.json({"error":false,"playing":false});
      });
    },
    stop: function() {
      /**
       * this function stops the currently playing stream
       */
      player.stop();
    }
  };
  return ret;
};
module.exports = Playlist;
