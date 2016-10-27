#!/usr/bin/env node
var Player = require("player"),
    player = new Player();

function Playlist(sock) {
  var self = this;

  // used for web socket push notifications / maintaining state
  this.sock = sock;
  this.paused = false;
  this.list = new Array(0);


  // used to know where in the playlist the user is at all times
  this.current = -1;
  this.prevTrack = false;
  this.nextTrack = false;

  this.add = function(track) {
    console.log("Adding track to playlist:",track.title);
    var serverRoot = "/var/www/Server/boombox/www/";
    this.list.push(track);
    player.add(serverRoot + track.filename);
  };
  this.remove = function(track) {
    var delNum = function(listTrack) {
      if (listTrack._id === track._id) {
        console.log("removing track from playlist:",listTrack.filename);
      }
      return listTrack._id === track._id;
    };
    this.list.splice(delNum,1);
  };
  this.prev = function() {
    // since node-player doesn't support this,
    // I'll either have to submit a pull request
    // or write my own implementation right here.
    // https://github.com/guo-yu/player
    
  };
  this.next = function() {
    /**
     * this function will advance the audio stream to the next song
     * unless no next song exists in the .list[] array.
     */
    player.next();
  };
  this.pause = function() {
    /**
     * this function will pause the audio stream if current playing
     * If the audio stream is currently paused, this function does nothing.
     */
    if (!this.paused) {
      this.paused = true;
      player.pause();
    }
    var toSend = {
      type: "playevent",
      playstate: {
        playing: false,
        prev: self.prevTrack,
        next: self.nextTrack,
        track: self.list[self.current]
      }
    };

    console.log(JSON.stringify(toSend));
    self.sock.send(JSON.stringify(toSend));
  };
  this.resume = function() {
    if (this.paused) {
      this.paused = false;
      player.pause();
    }
  };
  this.play = function() {
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
    });
  };
  this.onPlay = function(item) {
    /**
     * this function is called from player.onplay
     * we should push a notification saying that we are playing X song.
     * this helps keep the frontend in perfect sync with the server
     * @param {playerItem} the filename and full path/filename
     */
    self.prevTrack = false;
    self.nextTrack = false;
    if (self.current < self.list.length ) {
      self.nextTrack = self.list[self.current+1];
    }

    console.log("onPlay: ", arguments);

    var toSend = {
      type: "playevent",
      playstate: {
        playing: true,
        prev: self.prevTrack,
        next: self.nextTrack,
        track: false
      }
    };

    console.log(JSON.stringify(toSend));
    self.sock.send(JSON.stringify(toSend));
  };
  this.onPlayEnd = function(e) {
    /**
     * this function is called from player.onplayened.
     */
    console.log("onPlayEnd: ", arguments);

    var toSend = {
      type: "playevent",
      playstate: {
        playing: false,
        prev: self.prevTrack,
        next: self.nextTrack,
        track: false
      }
    };

    console.log(JSON.stringify(toSend));
    //self.sock.send(JSON.stringify(toSend));
  };
  this.onError = function(e) {
    /**
     * this function is called from player.onerror
     *
     */
    console.log("onError: ", arguments);
    var toSend = {
      type: "playevent",
      playstate: {
        playing: false,
        prev: self.prevTrack,
        next: self.nextTrack,
        track: false
      }
    };

    console.log(JSON.stringify(toSend));
    self.sock.send(JSON.stringify(toSend));
  };
  this.stop = function() {
    /**
     * this function stops the currently playing stream
     */
    this.paused = true;
    player.stop();
  };
};

module.exports = function(socket) {
  var playlist = new Playlist(socket);

  // special events from the player audio stream
  player.on("playend", playlist.onPlayEnd);
  player.on("playing", playlist.onPlay);
  player.on("error", playlist.onError);

  return playlist;
};
