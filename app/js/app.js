app = {
  artists: false,
  albums: false,
  tracks: false,
  getAlbumById: function(id) {
    /**
     * Searches through locally stored app.albums array
     * to find the album with this id.
     * @param {string} id - musicbrainz id of the album/release
     * @return {Object|undefined} undefined if not found, else Album object
     */
    return app.albums.find(function(item) {
      // find album with this id.
      return item._id === id;
    });
  },
  getArtistById: function(id) {
    /**
     * Searches through locally stored app.artists array
     * to find the artists with this id.
     * @param {string} id - musicbrainz id of the artist
     * @return {Object|undefined} undefined if not found, else Artist object
     */
    return app.artists.find(function(item) {
      // find album with this id.
      return item._id === id;
    });
  },
  getTrackById: function(id) {
    /**
     * Searches through locally stored app.tracks array
     * to find the song track with this id.
     * @param {string} id - musicbrainz id of the track
     * @return {Object|undefined} undefined if not found, else Track object
     */
    return app.albums.find(function(item) {
      // find album with this id.
      return item._id === id;
    });
  },
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
  prev: document.getElementById("control__playprev"),
  next: document.getElementById("control__playnext"),
  play: document.getElementById("control__playbtn"),
  onPrev: function(e) {
    e.preventDefault();
    if (app.state.prev) {
      // if the API says there is a "previous" song that we can play
      api.stream.prev(app.controls.playResponse);
    } else {
      // else error?
    }
  },
  onNext: function(e) {
    e.preventDefault();
    if (app.state.next) {
      // if the API says there is a "next" song that we can play
      api.stream.next(app.controls.playResponse);
    } else {
      // else error?
    }
  },
  onPlay: function(e) {
    e.preventDefault();
    api.stream.track.play(app.state.track._id, app.controls.playResponse);
  },
  playResponse: function(json) {
    if (json.error) {
      console.warn("Error, couldn't find item!",json);
      alert("Error! Could not find item");
    } else {
      console.log("playing:",json);

      // update the state
      app.setState(json);
      app.foot.update();

      // open the footer "now playing" thing
      app.foot.open();
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
