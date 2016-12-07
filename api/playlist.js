#!/usr/bin/env node
const spawn = require("child_process").spawn;

/**
 * creates a new serverside Playlist object
 * @classdesc does all the work for the playlist,
 *            including adding and removing songs,
 *            switching to previous and next songs,
 *            and playing/pausing/resuming the audio stream.
 * @constructor
 */
function Playlist(devices) {
  var self = this;
  
  /**
   * stores the currently executing process, if any.
   * if not, false.
   */
  this.proc = false;

  /**
   * logging verbosity
   * 0 == none
   * 1 == high-level only
   * 2 == medium level
   * 3 == nitty gritty details
   */
  this.verbosity = 3;

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

  /**
   * add a track to the playlist.
   * does not reset the playlist.
   * @param {Track} track
   * @returns {boolean} true for now
   */
  this.add = function(track) {
    self.log("Adding track to playlist:" + track.title);
    self.list.push(track);

    return true;
  };

  /**
   * remove a single track by track._id from playlist
   * @todo test this function
   * @param {Track} track
   * @returns {boolean} isInPlaylist - true if track is in playlist and was removed, else false
   */
  this.remove = function(track) {
    var isInPlaylist = false;
    var delNum = function(listTrack) {
      if (listTrack._id === track._id) {
        isInPlaylist = true;
        self.log("removing track from playlist:" + listTrack.filename);
      }
      return listTrack._id === track._id;
    };
    this.list.splice(delNum,1);
    return isInPlaylist;
  };

  /**
   * Switch to the previous track in the playlist.
   * since node-player doesn't support this,
   * I'll either have to submit a pull request
   * or write my own implementation right here.
   * https://github.com/guo-yu/player
   * @todo actually write this implementation.
   */
  this.prev = function() {
    self.playSong(self.prevTrack);
    self.current--;
  };

  /**
   * this function will advance the audio stream to the next song
   * unless no next song exists in the .list[] array.
   */
  this.next = function() {
    self.playSong(self.nextTrack);
    self.current++;
  };

  /**
   * this function will pause the audio stream if current playing
   * If the audio stream is currently paused, this function does nothing.
   */
  this.pause = function() {
    self.log("pause the current song");
    if (!this.paused) {
      this.paused = true;
      if (self.proc) {
        // pause process
        self.proc.kill('SIGSTOP')
      }
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

    self.log(toSend, 2);
    self.sendToClients(toSend);
  };

  /**
   * if the audio stream is currently in a paused state, UNpause it.
   * @returns {boolean} wasResumed
   */
  this.resume = function() {
    var wasResumed = false;

    if (this.paused) {
      this.paused = false;
      wasResumed = true;
      if (self.proc) {
        // resume process?
        self.proc.kill('SIGCONT')
      }
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

    self.log(toSend, 2);
    self.sendToClients(toSend);

    return wasResumed;
  };

  /**
   * Essentially a wrapper for "play these tracks, I don't care how!".
   * this function accepts a track or array of tracks
   * and adds each to the playlist.
   * it then starts the player.
   * @param {Track} tracks[] - the array of songs
   */
  this.play = function(tracks) {
    // clear the list!
    self.reset();

    tracks.forEach(function(track) {
      self.add(track);
    });

    // start at zero
    self.current = 0;
    self.playSong(tracks[self.current]);
  };

  /**
   * used to clear the current playlist and prev/next/current songs
   */
  this.reset = function() {
    self.list = [];
    self.current = -1;
    self.prevTrack = false;
    self.nextTrack = false;
  };
  /**
   * this function will start the audio stream.
   * If currently playing, it will first stop the current song,
   * clear the playlist, 
   * then start the new song.
   * @bug bug when audio stream should not start at song #0
   */
  this.start = function() {
    var self = this;

    if (!self.paused) {
      // they switched to a different track, album, artist, etc.
      // we should stop the player and clear the list.
      // We should also consider having a timeout
      // so we don't play one track over the top of the other
      self.stop();
      self.reset();
      
      // start the player on the next song,
      // which we assume was just added to player.list
      self.next();
    } else {
      // probably a bug in assuming we should start at index self.current...
      self.playSong(list[self.current]);
      self.paused = false;
    }
  };

  this.playSong = function(track) {
    // quit the current song first
    if (self.proc) {
      this.stop();
    }

    var args = [track.filename],
        opts = { detached: false };

    self.proc = spawn("mpg321", args, opts);
    // console.log(self.proc);
    self.proc.stderr.on("data", function(data) {
      console.log("error!", data);
    });
    self.proc.on("close", function(stdout,stderr) {
      self.log("play complete?", 2);
      self.log(stdout, 3);
      self.log(stderr, 3);
      self.paused = true;
    });

    self.onPlay(track);
  };


  /**
   * clear  all tracks from the current playlist.
   * Does not stop the audio stream!
   * @returns {boolean} wasCleared - true if this.list exists, false otherwise
   */
  this.clear = function() {
    var wasCleared = false;
    if (this.list) {
      this.list = [];
      wasCleared = true;
    }
    return wasCleared;
  };

  /**
   * this function is called from player.onplay
   * we should push a notification saying that we are playing X song.
   * this helps keep the frontend in perfect sync with the server
   * @param {playerItem} the filename and full path/filename
   */
  this.onPlay = function(item) {
    self.paused = false;
    self.prevTrack = false;
    self.nextTrack = false;

    // find currently playing track by full filename
    for (var i = 0; i < self.list.length; i++) {
      if (self.list[i]._id === item._id) {
        // set current integer
        self.current = i;
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

    self.log(toSend);
    self.sendToClients(toSend);
  };

  /**
   * this function is called from player.onplayened.
   * @param {Object} e - the event passed from player.onplayend
   */
  this.onPlayEnd = function(e) {
    self.log("onPlayEnd: ");

    var toSend = {
      type: "playevent",
      playstate: {
        playing: false,
        prev: self.prevTrack,
        next: self.nextTrack,
        track: false
      }
    };

    self.log(toSend);
    self.sendToClients(toSend);
  };

  /**
   * this function is called from player.onerror
   * @param {Object} e - the event passed from player.onerror
   */
  this.onError = function(e) {
    self.log("onError: ");
    var toSend = {
      type: "playevent",
      playstate: {
        playing: false,
        prev: self.prevTrack,
        next: self.nextTrack,
        track: false
      }
    };

    self.log(toSend);
    self.sendToClients(toSend);
  };

  /**
   * this function stops the currently playing stream
   */
  this.stop = function() {
    self.log("halting the song!!");
    if (self.proc) {
      // pause process?
      self.proc.kill('SIGINT');
      this.paused = true;
    }
  };

  /**
   * this function sends a message
   * to all websocket-connected clients
   * @param {object} dat - the message to send
   */
  this.sendToClients = function(dat) {
    if (typeof dat !== "string") {
      // if not string, convert to string before sending
      dat = JSON.stringify(dat);
    }

    // send it
    devices.forEach(function(socket) {
      self.log("sending message to socket: readyState=" + socket.readyState, 3);
      if (socket.readyState === 1) {
        // if the socket is open
        socket.send(dat);
      } else {
        self.log("socket is closed: readyState=" + socket.readyState, 3);
        // consider removing the socket from devices[] ?
      }
    });
  };

  /**
   * send debugging output to console
   * IF this.debug is true.
   * @param {string|object} data - stuff to log
   * @param {number} level - 1,2 or 3 in order from least-detailed to most-detailed
   */
  this.log = function(data,level) {
    switch(self.verbosity) {
        // notice this is out of order,
        // but we do that to make level1 the default.
      case 0:
        // no logging whatsoever
        break;
      case 3:
        // level 3 verbosity says log it, period.
        console.log(data);
        break;
      case 2:
        // but that is in order to make level2 the default
        // log any level2 or level3 stuff
        if (level < 3) {
          console.log(data);
        }
        break;
      default:
        // log only level 1 stuff
        if (level < 2) {
          console.log(data);
        }
        break;
    }
  };
};

module.exports = function(devices) {
  var playlist = new Playlist(devices);

  return playlist;
};
