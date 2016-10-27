var Api = function() {
  /**
   * api.js - this file does all the data interaction with the BoomBox API
   * this is purposely designed to match the API endpoints
   */
  var self = this;
  self.songs = {};
  self.albums = {};
  self.artists = {};
  self.stream = {};
  self.stream.track = {};
  self.stream.album = {};
  self.stream.artist = {};

  self.songs.get = function(opts,callback) {
    var data = opts;
    // console.log("getting tracks:", data);
    lib.ajax("/api/v1/track",data,callback);
  };
  /*
  self.songs.insert = function(opts) {
    // we may not need to insert tracks through the frontend.
  };
  */
  self.albums.get = function(opts, callback) {
    var data = opts;
    lib.ajax("/api/v1/album",data,callback);
  };
  self.artists.get = function(opts, callback) {
    var data = opts;
    lib.ajax("/api/v1/artist",data,callback);
  };

  // streaming endpoints
  self.stream.pause = function(callback) {
    lib.ajax("/api/v1/stream/pause",{},callback);
  };
  self.stream.play = function(type, id, callback) {
    var allowedStreamTypes = ["track","album","artist"];
    if (allowedStreamTypes.indexOf(type) == -1) {
      throw "Stream play type must be one of: " + allowedStreamTypes;
    }
    if (typeof callback !== "function") {
      throw "Callback is required.";
    }

    var apiUrl = "/api/v1/stream/" + type + "/" + id;
    lib.ajax(apiUrl,{},callback);
  };
  self.next = function(callback) {
    if (typeof callback !== "function") {
      throw "Callback is required.";
    }

    lib.ajax("/api/v1/stream/next",{},callback);
  };
  self.prev = function(callback) {
    if (typeof callback !== "function") {
      throw "Callback is required.";
    }

    lib.ajax("/api/v1/stream/prev",{},callback);
  };

  // track streaming endpoints
  self.stream.track.play = function(id,callback) {
    self.stream.play("track",id,callback);
  };
  self.stream.album.play = function(id,callback) {
    self.stream.play("album",id,callback);
  };
  self.stream.artist.play = function(id,callback) {
    self.stream.play("artist",id,callback);
  };
  self.stream.next = function(callback) {
    var apiUrl = "/api/v1/stream/next";
    lib.ajax(apiUrl,{},callback);
  };
  self.stream.prev = function(callback) {
    var apiUrl = "/api/v1/stream/prev";
    lib.ajax(apiUrl,{},callback);
  };

};
var api = new Api();

// lib.js - this is a short library of useful functions, primarily Ajax.

var Lib = function() {
  var self = this;

  this.selectParent = function(el, parentSelector) {
    /**
     * selectParent()
     * similar to jquery's closest() function,
     * the difference being that we are not chainable.
     * @param {Node} el - the element which has parents
     * @param {string} parentSelector - the CSS-style selector which will identify the parents we are searching for
     * @return {Node|boolean} An HTML node if if matches the parentSelector. Else false.
     */
    var matchesSelector = el.matches ||
													el.webkitMatchesSelector ||
													el.mozMatchesSelector ||
													el.msMatchesSelector;

    while (el) {
			// this loop traverses through the element's parent nodes
			if (matchesSelector.call(el, parentSelector)) {
				// if it's a match, quit and return true.
				break;
			}
			el = el.parentElement;
    }

    return el;
  };

  this.template = function(str, data) {
    /**
     * template()
     * do Mustache-style templating on a string.
     * Note this is SUPER basic. Does not do nesting, loops, conditionals, etc.
     * Just simple {name}-value replacement.
     * @param {string} str - the string to search/replace IN
     * @param {Object} data - a flat object of key/value pairs to insert into the HTML string.
     * @returns {string} a full HTML with no more {key} blocks unless the corresponding data[key] did not exist.
     */
    var retstr = str;

    // loop over all data properties
    for (var prop in data) {
      // create a regex searcher for {prop}
      var regex = new RegExp('\{'+prop+'\}','ig');
      //console.log("lib.js/template(): regex",regex);
      
      // update string
      retstr = retstr.replace(regex,data[prop]);
    }
    return retstr;
  };

  this.toDom = function(str) {
    /** toDom()
     * convert a string into a fully build nodeList
     * @param {string} str - the string of correctly-formatted HTML
     * @return {NodeList} the HTML list of nodes
     */
    var tmp = document.createElement("div");
    tmp.innerHTML = str;
    return tmp.childNodes;
  };

  this.serialize = function(obj) {
    /**
     * serialize()
     * take an object, output a string fit for the querystring.
     * @param {object} obj - the data object we wish to serialize.
     * @cite: http://stackoverflow.com/a/1714899/1525594
    */
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  };

  this.ajax = function(url,data,callback,method) {
    var reqBody = '',
        reqBoundary,
        reqMethod = method ? method : "GET";//method is GET by default
        data = data ? data : {}; // data object is empty object by default

    // parameter validation
    if (!url) { throw "lib.js/ajax(): Url is required."; }
    if (!callback) { throw "lib.js/ajax(): Callback is required."; }

    var myCallback = function(e) {
      //console.log("lib.js/ajax(): Ajax request completed!",arguments);
      callback(e.target.response,e.target);
    };

    var myRequest = new XMLHttpRequest();
    myRequest.responseType = "json";
    myRequest.addEventListener("load",myCallback);

    if (reqMethod === "POST") {
      myRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      reqBody = addFormData();
    } else if (reqMethod === "GET") {
      url = url + "?" + self.serialize(data);
    }

    // open the connection, send the data
    myRequest.open(reqMethod,url);
    myRequest.send(data);
  };

  return this;
};
lib = new Lib();

app = {
  artists: false,
  albums: false,
  tracks: false,
  init: function() {
    var self = this;

    // open web socket connection
    app.socket = new WebSocket("ws://localhost:8081");
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
    
    return this;
  },
  getAlbumById: function(id) {
    /**
     * Searches through locally stored app.albums array
     * to find the album with this id.
     * BUG: if app.albums is empty, this function triggers an error.
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
     * BUG: if app.artists is empty, this function triggers an error.
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
     * BUG: if app.tracks is empty, this function triggers an error.
     * @param {string} id - musicbrainz id of the track
     * @return {Object|undefined} undefined if not found, else Track object
     */
    return app.tracks.find(function(item) {
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
     * and insert them into the app.state object.
     * @param {State} state - the currently playing song
     * @return {State} state - the UPDATED playing state, with full album info and artist info
     */
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
    /**
     * this function is called by the "next" button in the app controls
     * it is called ONLY by pressing the "previous" button
     * @param {object} e - the event straight from the on("click") listener
     */
    e.preventDefault();
    if (app.state.prev) {
      // if the API says there is a "previous" song that we can play
      api.stream.prev(app.controls.playResponse);
    } else {
      // else error?
    }
  },
  onNext: function(e) {
    /**
     * this function is called by the "next" button in the app controls
     * it is called ONLY by pressing the "next" button
     * @param {object} e - the event straight from the on("click") listener
     */
    e.preventDefault();
    if (app.state.next) {
      // if the API says there is a "next" song that we can play
      api.stream.next(app.controls.playResponse);
    } else {
      // else error?
    }
  },
  onPlay: function(e) {
    /**
     * this function is called by the "play" button in the app controls
     * it is called ONLY by pressing the play/pause button
     * it determines whether to
     * - pause the current song,
     * - or resume the current song
     * @param {object} e - the event straight from the on("click") listener
     */
    e.preventDefault();
    api.stream.pause(app.controls.playResponse);
  },
  playResponse: function(json) {
    if (json.error) {
      console.warn("Error, couldn't find item!",json);
      alert("Error! Could not find item");
    } else {
      console.log("playing:",json);


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
  },
  open: function() {
    /**
     * open the controls / now playing footer
     * by adding the class .open-footer to the body element.
     * It's up to the CSS to do something with that class.
     */
    document.body.classList.add("open-footer");
  }
};

app.init();

//main.js - This file does all the app-ish stuff. Includes buttons, animations, and possibly offline functionality.


// Buttons!
var settingsBtn = document.getElementById("btnSettings"),
    searchBtn = document.getElementById("btnSearch"),
    songTab = document.getElementById("tab__songs"),
    artistTab = document.getElementById("tab__artists"),
    albumTab = document.getElementById("tab__albums"),
    statusBar = document.getElementById("app-statusbar");

// the "Songs" tab in the app nav
var songTabClick = function(e) {
  /**
   * Deal with someone clicking the song tab or pulling to refresh.
   * later, we'll set refresh = true if someone swiped down.
   * This allows us to update the local storage if, say, new songs were ripped from a CD.
   */
  e.preventDefault();

  if (!app.tracks) {
    // get all songs
    api.songs.get({},loadSongs);
  } else {
    loadSongs(app.tracks);
  }

  // clear status bar
  statusBar.innerHTML = '';

  // load data into page
  albumTab.classList.remove("active");
  artistTab.classList.remove("active");
  songTab.classList.add("active");
};

// the "Albums" tab in the app nav
var albumTabClick = function(e) {
  /**
   * Deal with someone clicking the album tab or pulling to refresh.
   * later, we'll set refresh = true if someone swiped down.
   * This allows us to update the local storage if, say, new songs were ripped from a CD.
   */
  e.preventDefault();

  if (!app.albums) {
    // get all songs
    api.albums.get({},loadAlbums);
  } else {
    loadAlbums(app.albums);
  }

  // clear status bar
  statusBar.innerHTML = '';

  // load data into page
  songTab.classList.remove("active");
  artistTab.classList.remove("active");
  albumTab.classList.add("active");
};

// the "Artists" tab in the app nav
var artistTabClick = function(e) {
  /**
   * Deal with someone clicking the album tab or pulling to refresh.
   * later, we'll set refresh = true if someone swiped down.
   * This allows us to update the local storage if, say, new songs were ripped from a CD.
   */
  e.preventDefault();

  if (!app.artists) {
    // get all songs
    api.artists.get({},loadArtists);
  } else {
    loadArtists(app.artists);
  }

  // clear status bar
  statusBar.innerHTML = '';

  // load data into page
  songTab.classList.remove("active");
  albumTab.classList.remove("active");
  artistTab.classList.add("active");
};

// Data
// here we set up the loading of song lists, album lists, artist lists, etc.
var dataBox = document.getElementById("app-data");

var openSettings = function() {
  document.getElementById("app-settings").classList.toggle("open");
};


// events
// here we set up all the button click events
settingsBtn.addEventListener("click",openSettings);
songTab.addEventListener("click", songTabClick);
albumTab.addEventListener("click", albumTabClick);
artistTab.addEventListener("click", artistTabClick);
document.getElementById("clear__cache").addEventListener("click", function(e) {
  if (typeof window.localStorage !== "undefined") {
    // we later may want to clear just app.tracks, app.albums, and app.artists, for example
    app.albums = false;
    app.artists = false;
    app.tracks = false;
    window.localStorage.clear();
  }
  e.preventDefault();
});

// Get songs
var loadSongs = function(json) {
  var songTemplate = '<div class="list-item" id="{_id}" data-type="track"><div class="track__info"><h4 class="title">{title}</h4><h5 class="artist__name">{artistname}</h5></div><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';

  app.tracks = json;

  // for each song, append the artist name
  if (!json[0].artistname && app.artists.length) {
    for (var i=0; i < json.length; i++) {
      // for each stored artist, check the id against the current track.artistid
      thisArtist = app.getArtistById(json[i].artistid);
      if (thisArtist) {
        json[i].artistname = thisArtist.name;
      }
    }
  }

  if (typeof window.localStorage === "object") {
    localStorage.setItem("tracks", JSON.stringify(json));
  }

  return loadItems(json,songTemplate);
};
var loadArtists = function(json) {
  var songTemplate = '<div class="list-item item__artist" id="{_id}" data-type="artist"><h4 class="title">{name}</h4><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';

  app.artists = json;
  if (typeof window.localStorage === "object") {
    localStorage.setItem("artists", JSON.stringify(json));
  }

  return loadItems(json,songTemplate);
};
var loadAlbums = function(json) {
  var songTemplate = '<div class="list-item item__album" id="{_id}" data-type="album"><h4 class="title">{title}</h4><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';

  app.albums = json;
  if (typeof window.localStorage === "object") {
    localStorage.setItem("albums", JSON.stringify(json));
  }

  return loadItems(json,songTemplate);
};
var loadItems = function(json, mediaTemplate) {
  dataBox.innerHTML = '';

  // insert into page
  for (var i=0;i<json.length;i++) {
    // use our new template function in the library
    var song = lib.toDom(lib.template(mediaTemplate,json[i]));
    dataBox.appendChild(song[0]);
    
    var curSong = new mediaItem(document.getElementById(json[i]._id));
  }
};

//This object does all the stuff with the song divs.
var mediaItem = function(item) {
  var self = this,
      playbutton = item.querySelector(".fa");

  this.clearBtns = function() {
    var curPlayingSongBtn = document.querySelector(".fa.fa-pause");
    if (curPlayingSongBtn) {
      curPlayingSongBtn.classList.remove("fa-pause");
      curPlayingSongBtn.classList.add("fa-play");
    }
  };

  this.play = function(e) {
    self.clearBtns();
    item.classList.add("active");
    playbutton.classList.remove("fa-play");
    playbutton.classList.add("fa-pause");

    // play the particular type of media
    switch(item.dataset.type) {
      case "album":
        // play all the songs in the album
        api.stream.album.play(item.id, app.controls.playResponse);
        break;
      case "artist":
        // play all the songs for the particular artist
        api.stream.artist.play(item.id, app.controls.playResponse);
        break;
      case "track":
        // play this particular song
        api.stream.track.play(item.id, app.controls.playResponse);
        break;
    }
  };


  this.pause = function(e) {
    item.classList.remove("active");
    playbutton.classList.add("fa-play");
    playbutton.classList.remove("fa-pause");
    api.pause(item.id, function() {
      console.log("Whoa... it's paused!?",arguments);
    });
  };

  this.toggle = function(e) {
    if (item.classList.contains("active")) {//then song is being played right now.
      self.pause(e);
    } else {//else song is currently paused. play it!
      self.play(e);
    }
  };

  // setup the play/pause button event listener
  item.querySelector(".playBtn").addEventListener("click",self.toggle);

  return this;
};
var loadSongsByX = function(e) {
  var item, opts,
      album = lib.selectParent(e.target, ".item__album"),
      artist = lib.selectParent(e.target, ".item__artist");

  if (album) {
    //console.log("found album:", album);
		if (album) {
      loadSongsByAlbum(album.id);
    }
  } else if (artist) {
    //console.log("found artist:", artist);
		if (artist) {
      loadSongsByArtist(artist.id);
    }
	}
};
loadSongsByAlbum = function(albumid) {
  var thisAlbum = app.getAlbumById(albumid),
      statusTemplate = "<h2>{album}</h2><h4>by {artist}</h4>",
      dat = {
        album: thisAlbum.title,
        artist: app.getArtistById(thisAlbum.artistid).name
      };

  // put album name in status bar
  statusBar.innerHTML = lib.template(statusTemplate, dat);

  // query for songs by album ID
  opts = {
    albumid: albumid
  };
  api.songs.get(opts, loadSongs);
};
loadSongsByArtist = function(artistid) {
  var thisArtist = app.getArtistById(artistid);
  artistTitle = '<h2>' + thisArtist.name + '</h2>';

  // put artist name in status bar
  statusBar.innerHTML = artistTitle;

  // query for songs by artist ID
  opts = {
    artistid: artistid
  };
  api.songs.get(opts, loadSongs);
};

// on initial page load, show all the songs
songTab.click();

// window event listeners - listen for clicks on the non-existent album or artist divs
window.addEventListener("click", loadSongsByX);

//# sourceMappingURL=app.js.map