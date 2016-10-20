app = {
  artists: false,
  albums: false,
  tracks: false,
  loadFromLS: function() {
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
  },
  state: {
    /**
     * this object helps keep track of the currently playing song,
     * albumid, artistid, nextid, previd, play/pause, etc.
     * @typedef {Object} state
     * @property {boolean} state.playing - is there a track playing this very second?
     * @property {(boolean|string)} state.prev - if there is a "previous" song in the playlist, its id is stored here. Else false.
     * @property {(boolean|string)} state.next - if there is a "next" song in the playlist, its id is stored here. Else false.
     *
     */
    playing: false,
    prev: false,
    next: false
  },
  setState: function(state) {
    /**
     * knowing the current track in the state,
     * get the album info and artist info
     * @param {State} state - the currently playing song
     * @return {State} state - the UPDATED playing state, with full album info and artist info
     */
    app.state = state;
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
  }
};
app.controls = {
  /**
   * app controls
   * This file manages the "Now Playing" bar at the bottom of the app.
   * Includes a play/pause button, a track title, album title, artist title
  */
  prev: document.getElementById("control__playprev"),
  next: document.getElementById("control__playnext"),
  play: document.getElementById("control__playbtn"),
  onPrev: function(e) {
    if (app.state.prev) {
      // if the API says there is a "previous" song that we can play
      api.stream.track.play(app.state.prev,callback);
    } else {
      // else error?
    }
  },
  onNext: function(e) {
    if (app.state.next) {
      // if the API says there is a "next" song that we can play
      api.stream.track.play(app.state.next,callback);
    } else {
      // else error?
    }
  },
  onPlay: function(e) {
    if (app.state.playing) {
      // pause
    } else {
      // else play the current song
      // as defined in app.state.track._id
      // api.stream.track.play(app.state.track._id,callback);
    }
  }
};
app.foot = {
  trackEl: document.querySelector(".playing__track__title"),
  artistEl: document.querySelector(".playing__track__artist"),
  albumEl: document.querySelector(".playing__track__album"),

  update: function() {
    /**
     * fill the footer's "now playing" info
     */
    app.foot.trackEl.innerHTML = app.state.track.title;
    app.foot.artistEl.innerHTML = app.state.artist.name;
    app.foot.albumEl.innerHTML = app.state.album.title;
  },
  open: function() {
    /**
     * open the controls / now playing footer
     */
    document.body.classList.add("open-footer");
  }
};
app.controls.prev.addEventListener("click", app.controls.onPrev);
app.controls.next.addEventListener("click", app.controls.onNext);
app.controls.play.addEventListener("click", app.controls.onPlay);

// get albums, artists, and tracks from local storage
app.loadFromLS();
