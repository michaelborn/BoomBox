#!/usr/bin/env node

/**
 * creates a new serverside Playlist object
 * @classdesc does all the work for the playlist,
 *            including adding and removing songs,
 *            switching to previous and next songs,
 *            and playing/pausing/resuming the audio stream.
 * @constructor
 */
function Playlist(sock, player) {
  var self = this;

  /**
   * root of the server.
   * @todo make this more intelligent by either making it a config variable
   *       or always storing the data in a known location
   *       e.g. /usr/share/boombox
   * @type {string}
   */
  this.serverRoot = "/var/www/Server/boombox/www/";

  /**
   * store the current paused/not paused state of the audio stream
   * @type {boolean}
   */
  this.paused = true;

  /**
   * array of all tracks in the playlist
   * @type {Track[]}
   */
  this.list = new Array(0);


  /**
   * used to know where in the playlist is currently playing
   * @type {number}
   */
  this.current = -1;

  /**
   * whether or not there is currently a "previous" track in the playlist
   * @type {boolean}
   */
  this.prevTrack = false;

  /**
   * whether or not there is currently a "next" track in the playlist
   * @type {boolean}
   */
  this.nextTrack = false;

  this.add = function(track) {
    /**
     * add a track to the playlist.
     * does not reset the playlist.
     * @param {Track} track
     * @returns {boolean} true for now
     */
    console.log("Adding track to playlist:",track.title);
    self.list.push(track);
    player.add(self.serverRoot + track.filename);

    return true;
  };
  this.remove = function(track) {
    /**
     * remove a single track by track._id from playlist
     * @todo test this function
     * @param {Track} track
     * @returns {boolean} isInPlaylist - true if track is in playlist and was removed, else false
     */
    var isInPlaylist = false;
    var delNum = function(listTrack) {
      if (listTrack._id === track._id) {
        isInPlaylist = true;
        console.log("removing track from playlist:",listTrack.filename);
      }
      return listTrack._id === track._id;
    };
    this.list.splice(delNum,1);
    return isInPlaylist;
  };
  this.prev = function() {
    /**
     * Switch to the previous track in the playlist.
     * since node-player doesn't support this,
     * I'll either have to submit a pull request
     * or write my own implementation right here.
     * https://github.com/guo-yu/player
     * @todo actually write this implementation.
     */
    
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
    sock.send(JSON.stringify(toSend));
  };
  this.resume = function() {
    /**
     * if the audio stream is currently in a paused state, UNpause it.
     * @returns {boolean} wasResumed
     */
    var wasResumed = false;

    if (this.paused) {
      this.paused = false;
      wasResumed = true;
      player.pause();
    }

    return wasResumed;
  };
  this.play = function(tracks) {
    /**
     * Essentially a wrapper for "play these tracks, I don't care how!".
     * this function accepts a track or array of tracks
     * and adds each to the playlist.
     * it then starts the player.
     * @param {Track} tracks[] - the array of songs
     */
    tracks.forEach(function(track) {
      self.add(track);
    });
    self.start();
  };
  this.start = function() {
    /**
     * this function will start the audio stream.
     * If currently playing, it will first stop the current song,
     * clear the playlist, 
     * then start the new song.
     */
    var self = this;

    if (!self.paused) {
      // they switched to a different track, album, artist, etc.
      // we should stop the player and clear the list.
      // We should also consider having a timeout
      // so we don't play one track over the top of the other
      player.stop();
      // self.clear();
      
      // start the player on the next song,
      // which we assume was just added to player.list
      self.next();
    } else {
      player.play(function(err, player) {
        self.paused = true;
        console.log("End of playback!",arguments);
      });
    }
  };
  this.clear = function() {
    /**
     * clear  all tracks from the current playlist.
     * Does not stop the audio stream!
     * @returns {boolean} wasCleared - true if this.list exists, false otherwise
     */
    var wasCleared = false;
    if (this.list) {
      this.list = [];
      wasCleared = true;
    }
    return wasCleared;
  };
  this.onPlay = function(item) {
    /**
     * this function is called from player.onplay
     * we should push a notification saying that we are playing X song.
     * this helps keep the frontend in perfect sync with the server
     * @param {playerItem} the filename and full path/filename
     */
    self.paused = false;
    self.prevTrack = false;
    self.nextTrack = false;

    // find currently playing track by full filename
    for (var i = 0; i < self.list.length; i++) {
      var fullFile = self.serverRoot + self.list[i].filename;
      console.log("checking:", fullFile, item.src);
      if (fullFile === item.src) {
        self.current = i;
        console.log("Found current!",self.current);
        break
      } // else keep searching
    }

    // if playlist is longer than the current song position,
    // then set nextTrack to the current plus 1
    if (self.current < self.list.length - 1 ) {
      self.nextTrack = self.list[self.current+1];
    }
    if (self.current > 0 && self.list.length > 1) {
      self.prevTrack = self.list[self.current-1];
    }

    var toSend = {
      type: "playevent",
      playstate: {
        playing: true,
        prev: self.prevTrack,
        next: self.nextTrack,
        track: self.list[self.current]
      }
    };

    // console.log(JSON.stringify(toSend));
    sock.send(JSON.stringify(toSend));
  };
  this.onPlayEnd = function(e) {
    /**
     * this function is called from player.onplayened.
     * @param {Object} e - the event passed from player.onplayend
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
    //sock.send(JSON.stringify(toSend));
  };
  this.onError = function(e) {
    /**
     * this function is called from player.onerror
     * @param {Object} e - the event passed from player.onerror
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
    sock.send(JSON.stringify(toSend));
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
  var Player = require("player"),
      player = new Player(),
      playlist = new Playlist(socket, player);

  // special events from the player audio stream
  player.on("playend", playlist.onPlayEnd);
  player.on("playing", playlist.onPlay);
  player.on("error", playlist.onError);

  return playlist;
};
