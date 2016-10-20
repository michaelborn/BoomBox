app = {
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
     */
    if (app.state.albumid) {
      // get the album by id
      // note, all these albums / artists come from local storage
      app.state.artist = app.artists[app.state.artistid];
    }
    if (app.state.albumid) {
      // get the album by id
      // note, all these albums / artists come from local storage
      app.state.album = app.albums[app.state.albumid];
    }


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
      // as defined in app.state.trackid
      // api.stream.track.play(app.state.trackid,callback);
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
    app.foot.artistEl.innerHTML = app.state.artist.title;
    app.foot.albumEl.innerHTML = app.state.album.title;
  }
};
app.controls.prev.addEventListener("click", app.controls.onPrev);
app.controls.next.addEventListener("click", app.controls.onNext);
app.controls.play.addEventListener("click", app.controls.onPlay);
