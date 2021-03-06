/**
 * create a new clientside App object.
 * @class
 * @classdesc The remote control web app for Boombox.
 *            basically all the app-ish type stuff.
 *            buttons, footer controls, etc.
 */
App = function() {
  var self = this;

  this.artists = false;
  this.albums = false;
  this.tracks = false;
  this.controls = {};
  this.foot = {};

  /**
   * More or less a "setup" function.
   * Starts the web socket, sets up a few event listeners.
   * @return {Api}
   */
  this.init = function() {
    var self = this;

    // open web socket connection
    self.socket = new WebSocket("wss://" + location.host);
    self.socket.onopen = function(ev) {
      console.log("Socket is open!", ev);
    };
    self.socket.onmessage = function(dat) {
      var json = JSON.parse(dat.data);
      console.log("received message from websocket connection!", json);

      // handle app state changes
      switch(json.type) {
        case "playevent":

          if (typeof json.playstate.track !== "undefined") {
            // show the track icon as "playing" or paused
            // depending on the playstate.playing==true or false, respectively
            self.toggleIcon(json.playstate.track._id, json.playstate.playing);
          }

          if (typeof json.playstate.album !== "undefined") {
            // show the album icon as "playing" or paused
            self.toggleIcon(json.playstate.album._id, json.playstate.playing);
          }

          if (typeof json.playstate.artist !== "undefined") {
            // show the artist icon as "playing" or paused
            self.toggleIcon(json.playstate.artist._id, json.playstate.playing);
          }

          // update the state
          self.setState(json.playstate);

          // update the footer "now playing" info
          self.foot.update();

          // if currently playing, open footer
          if (json.playstate.playing) {
            self.foot.open();
          }

          break;
        default:
          // who knows
          break;
      }
    };

    // get albums, artists, and tracks from local storage
    self.loadFromLS();

    // setup event listeners
    self.controls.prev.addEventListener("click", self.controls.onPrev);
    self.controls.next.addEventListener("click", self.controls.onNext);
    self.controls.play.addEventListener("click", self.controls.onPlay);
  };

  /**
   * Searches through locally stored app.albums array
   * to find the album with this id.
   * BUG: if app.albums is empty, this function triggers an error.
   * @param {string} id - musicbrainz id of the album/release
   * @return {Object|undefined} undefined if not found, else Album object
   */
  this.getAlbumById = function(id) {
    return self.albums.find(function(item) {
      // find album with this id.
      return item._id === id;
    });
  };

  /**
   * Searches through locally stored app.artists array
   * to find the artists with this id.
   * BUG: if app.artists is empty, this function triggers an error.
   * @param {string} id - musicbrainz id of the artist
   * @return {Object|undefined} undefined if not found, else Artist object
   */
  this.getArtistById = function(id) {
    return self.artists.find(function(item) {
      // find album with this id.
      return item._id === id;
    });
  };

  /**
   * Searches through locally stored app.tracks array
   * to find the song track with this id.
   * BUG: if app.tracks is empty, this function triggers an error.
   * @param {string} id - musicbrainz id of the track
   * @return {Object|undefined} undefined if not found, else Track object
   */
  this.getTrackById = function(id) {
    return self.tracks.find(function(item) {
      // find album with this id.
      return item._id === id;
    });
  };

  /**
   * load app data from local storage.
   * This is WAY faster than a network request!
   * Works offline too.
   */
  this.loadFromLS = function() {
    if (typeof window.localStorage !== "object") {
      console.warn("Browser does not support local storage.");
    } else {
      if (localStorage.getItem("tracks")) {
        self.tracks = JSON.parse(localStorage.getItem("tracks"));
      }
      if (localStorage.getItem("artists")) {
        self.artists = JSON.parse(localStorage.getItem("artists"));
      }
      if (localStorage.getItem("albums")) {
        self.albums = JSON.parse(localStorage.getItem("albums"));
      }
    }
  };

  /**
   * this object helps keep track of the currently playing song,
   * albumid, artistid, nextid, previd, play/pause, etc.
   * @typedef {Object} state
   * @property {boolean} state.playing - is there a track playing this very second?
   * @property {(boolean|string)} state.prev - if there is a "previous" song in the playlist, its id is stored here. Else false.
   * @property {(boolean|string)} state.next - if there is a "next" song in the playlist, its id is stored here. Else false.
   *
   */
  this.state = {
    playing: false,
    prev: false,
    next: false
  };

  /**
   * knowing the current track in the state,
   * get the album info and artist info
   * and insert them into the self.state object.
   * @param {State} state - the currently playing song
   * @return {State} state - the UPDATED playing state, with full album info and artist info
   */
  this.setState = function(state) {
    self.state = state;
    self.state.artist = false;
    self.state.album = false;

    if (self.state.track.artistid && self.artists) {
      // get the album by id
      // note, all these albums / artists come from local storage
      self.state.artist = self.artists.find(function(x) {
        return x._id === self.state.track.artistid;
      });
    }

    if (self.state.track.albumid && self.albums) {
      // get the album by id
      // note, all these albums / artists come from local storage
      self.state.album = self.albums.find(function(x) {
        return x._id === self.state.track.albumid;
      });
    }

    return self.state;
  };

  /**
   * app controls
   * This file manages the "Now Playing" bar and app controls
   * at the bottom of the app.
   *
   * The app controls include
   *    play/pause button,
   *    previous song button,
   *    next button
   *
   * The "Now Playing" bar includes
   *    track title,
   *    album title,
   *    artist title
  */
  this.controls.prev = document.getElementById("control__playprev");
  this.controls.next = document.getElementById("control__playnext");
  this.controls.play = document.getElementById("control__playbtn");

  /**
   * this function is called by the "play" button in the app controls
   * it is called ONLY by pressing the play/pause button
   * it determines whether to
   * - pause the current song,
   * - or resume the current song
   * @param {object} e - the event straight from the on("click") listener
   */
  this.controls.onPlay = function(e) {
    e.preventDefault();
    if(!self.state.playing) {
      api.playTrack(self.state.track._id, self.controls.playResponse);
    } else {
      api.pauseStream(self.controls.playResponse);
    }
  };

  /**
   * @todo write documentation
   */
  this.controls.playResponse = function(json) {
    if (json.error) {
      console.warn("Error, couldn't find item!",json);
      alert("Error! Could not find item");
    } else {
      console.log("playing:",json);

      // open the footer "now playing" thing
      self.foot.open();
    }
  };

  /*
   * toggleIcon()
   * find the "play" button for the now playing item
   * (whether track, artist or album)
   * and switch the icon to "pause"
   * @param {string} itemId - track, artist or album id
   * @param {boolean} showPause - if true, shows "pause" icon, else shows "play" icon.
   * @returns {boolean} itemExists - true if div[itemId] exists, else false
   */
  this.toggleIcon = function(itemId, showPause) {
    var icon,
        item = document.getElementById(itemId);

    if (item) {
      icon = item.querySelector(".fa");
      if (icon) {
        if (showPause) {
          icon.classList.remove("fa-play");
          icon.classList.add("fa-pause");
        } else {
          icon.classList.remove("fa-pause");
          icon.classList.add("fa-play");
        }
      }
    }

    //return boolean item, NOT truthy item!
    return !!item && !!icon;
  };


  /**
   * this function is called by the "next" button in the app controls
   * it is called ONLY by pressing the "previous" button
   * @param {object} e - the event straight from the on("click") listener
   */
  this.controls.onPrev = function(e) {
    e.preventDefault();
    if (self.state.prev) {
      // if the API says there is a "previous" song that we can play
      api.playPrev(self.controls.playResponse);
    } else {
      // else error?
    }
  };

  /**
   * this function is called by the "next" button in the app controls
   * it is called ONLY by pressing the "next" button
   * @param {object} e - the event straight from the on("click") listener
   */
  this.controls.onNext = function(e) {
    e.preventDefault();
    if (self.state.next) {
      // if the API says there is a "next" song that we can play
      api.playNext(self.controls.playResponse);
    } else {
      // else error?
    }
  };


  // App footer
  this.foot.trackEl = document.querySelector(".playing__track__title");
  this.foot.artistEl = document.querySelector(".playing__track__artist");
  this.foot.albumEl = document.querySelector(".playing__track__album");

  /**
   * fill the footer's "now playing" info
   * using
   * - app.state.track.title,
   * - app.state.artist.name, and
   * - app.state.album.title
   *
   * Also, disabled or enables the previous and next buttons
   * as appropriate, depending on
   * - app.state.prev !== false and
   * - app.state.next !== false
   */
  this.foot.update = function() {
    var playIcon = self.controls.play.querySelector(".fa");

    // update "now playing" info
    self.foot.trackEl.innerHTML = self.state.track.title;
    self.foot.artistEl.innerHTML = self.state.artist.name;
    self.foot.albumEl.innerHTML = self.state.album.title;

    // if there is no "next" song, disable the button
    if (!self.state.next) {
      self.controls.next.classList.add("disabled");
    } else {
      self.controls.next.classList.remove("disabled");
    }

    // if there is no "previous" song, disable the button
    if (!self.state.prev) {
      self.controls.prev.classList.add("disabled");
    } else {
      self.controls.prev.classList.remove("disabled");
    }

    if (!self.state.playing) {
      // if paused, show the "play" icon
      playIcon.classList.add("fa-play");
      playIcon.classList.remove("fa-pause");
    } else {
      // if playing, show the "pause" icon
      playIcon.classList.remove("fa-play");
      playIcon.classList.add("fa-pause");
    }
  };

  /**
   * open the controls / now playing footer
   * by adding the class .open-footer to the body element.
   * It's up to the CSS to do something with that class.
   */
  this.foot.open = function() {
    document.body.classList.add("open-footer");
  };

  /**
   * close the now playing footer, typically when the music pauses
   * by adding the class .open-footer to the body element.
   * It's up to the CSS to do something with that class.
   */
  this.foot.close = function() {
    document.body.classList.remove("open-footer");
  };

  // call init to set up the footer
  this.init();
};

var app = new App();
