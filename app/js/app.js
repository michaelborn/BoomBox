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
    app.socket = new WebSocket("wss://" + location.host);
    app.socket.onopen = function(ev) {
      // console.log("Socket is open!", ev);
    };
    app.socket.onmessage = function(dat) {
      var json = JSON.parse(dat.data);
      console.log("received message from websocket connection!", json);

      // handle app state changes
      switch(json.type) {
        case "playevent":

          // update the state
          app.setState(json.playstate);

          // update the footer "now playing" info
          app.foot.update();

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
    return app.albums.find(function(item) {
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
    return app.artists.find(function(item) {
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
    return app.tracks.find(function(item) {
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
        app.tracks = JSON.parse(localStorage.getItem("tracks"));
      }
      if (localStorage.getItem("artists")) {
        app.artists = JSON.parse(localStorage.getItem("artists"));
      }
      if (localStorage.getItem("albums")) {
        app.albums = JSON.parse(localStorage.getItem("albums"));
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
   * and insert them into the app.state object.
   * @param {State} state - the currently playing song
   * @return {State} state - the UPDATED playing state, with full album info and artist info
   */
  this.setState = function(state) {
    app.state = state;
    app.state.artist = false;
    app.state.album = false;

    if (app.state.track.artistid && app.artists) {
      // get the album by id
      // note, all these albums / artists come from local storage
      app.state.artist = app.artists.find(function(x) {
        return x._id === app.state.track.artistid;
      });
    }

    if (app.state.track.albumid && app.albums) {
      // get the album by id
      // note, all these albums / artists come from local storage
      app.state.album = app.albums.find(function(x) {
        return x._id === app.state.track.albumid;
      });
    }

    return app.state;
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
    if(!app.state.playing) {
      api.stream.track.play(app.state.track._id, app.controls.playResponse);
    } else {
      api.stream.pause(app.controls.playResponse);
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
      app.foot.open();
    }
  };

  /**
   * this function is called by the "next" button in the app controls
   * it is called ONLY by pressing the "previous" button
   * @param {object} e - the event straight from the on("click") listener
   */
  this.controls.onPrev = function(e) {
    e.preventDefault();
    if (app.state.prev) {
      // if the API says there is a "previous" song that we can play
      api.stream.prev(app.controls.playResponse);
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
    if (app.state.next) {
      // if the API says there is a "next" song that we can play
      api.stream.next(app.controls.playResponse);
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
    var playIcon = app.controls.play.querySelector(".fa");

    // update "now playing" info
    app.foot.trackEl.innerHTML = app.state.track.title;
    app.foot.artistEl.innerHTML = app.state.artist.name;
    app.foot.albumEl.innerHTML = app.state.album.title;

    // if there is no "next" song, disable the button
    if (!app.state.next) {
      app.controls.next.classList.add("disabled");
    } else {
      app.controls.next.classList.remove("disabled");
    }

    // if there is no "previous" song, disable the button
    if (!app.state.prev) {
      app.controls.prev.classList.add("disabled");
    } else {
      app.controls.prev.classList.remove("disabled");
    }

    if (!app.state.playing) {
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

  // call init to set up the footer
  this.foot.init();
};

var app = new App();
