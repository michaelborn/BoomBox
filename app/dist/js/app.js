/**
 * create a new clientside API object
 * @class
 * @classdesc this file does all the data interaction with the BoomBox API
 *            this is purposely designed to match the API endpoints
 */
var ApiInterface = function() {
  /**
   * @typedef {Object} searchOpts
   * @property {string} id - the unique musicbrainz id of the single
   * item you wish to retrieve
   * @property {number} limit - max number of items to retrieve
   * @property {number} page - get items starting at number ((page-1)*limit)+1
   * @property {string} search - search phrase to find in item name or title
   */

  /**
   * returns the result of the AJAX http request.
   * Entire AJAX request is included in callback.
   * @callback getCallback
   * @param {Object} HTTP response
   */

  var self = this;
  this.songs = {};
  this.albums = {};
  this.artists = {};
  this.stream = {};
  this.stream.track = {};
  this.stream.album = {};
  this.stream.artist = {};

  /**
   * get songs from server
   * @param {searchOpts}
   * @param {getCallback} callback - the AJAX response from the server
   * @see Api#getTracks
   */
  this.getTracks = function(opts,callback) {
    var data = opts;
    // console.log("getting tracks:", data);
    lib.ajax("/api/v1/track",data,callback);
  };

  /**
   * Send a new track to the server
   * @param {Track}
   * @param {insertResponse} callback - callback receives result of the insert attempt
   * @see Api#insertTracks
   */
  this.insertTracks = function(track) {
    // we may eventually need to insert tracks through the frontend.
  };

  /**
   * get albums from server by id,search phrase, etc.
   * @param {searchOpts}
   * @param {getCallback} callback - the AJAX response from the server
   * @see Api#getAlbums
   */
  this.getAlbums = function(opts, callback) {
    var data = opts;
    lib.ajax("/api/v1/album",data,callback);
  };

  /**
   * get artists from server by id,search phrase, etc.
   * @param {searchOpts}
   * @param {getCallback} callback - the AJAX response from the server
   * @see API#getArtists
   */
  this.getArtists = function(opts, callback) {
    var data = opts;
    lib.ajax("/api/v1/artist",data,callback);
  };

  // streaming endpoints
  /**
   * pause the currently playing item
   * @param {pauseResponse} callback - response given when pausing an item
   * @see Playlist#pause
   */
  this.pauseStream = function(callback) {
    lib.ajax("/api/v1/stream/pause",{},callback);
  };

  /**
   * play a track, artist, or album by ID
   * @param {string} type - one of "track","album","artist"
   * @param {string} id - unique ID of the item to play
   * @param {playResponse} callback - result of the play action
   * @see Playlist#play
   */
  this.playStream = function(type, id, callback) {
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

  /**
   * play a certain track, given its id
   * @param {string} id - the unique id of the track we wish to play
   * @param {playResponse} callback - result of the play action
   * @see Playlist#play
   */
  this.playTrack = function(id,callback) {
    self.stream.play("track",id,callback);
  };

  /**
   * play a certain album, given its id
   * @param {string} id - the unique id of the album we wish to listen to
   * @param {playResponse} callback - result of the play action
   * @see Playlist#play
   */
  this.playAlbum = function(id,callback) {
    self.stream.play("album",id,callback);
  };

  /**
   * play all songs by a certain artist, given its id
   * @param {string} id - the unique id of the artist we wish to listen to
   * @param {playResponse} callback - result of the play action
   * @see Playlist#play
   */
  this.playArtist = function(id,callback) {
    self.stream.play("artist",id,callback);
  };

  /**
   * Skip to the next song in the pre-computed playlist.
   * The playlist is reset when
   *  - user clicks "play" button on a track,
   *  - user clicks "play" buton on an artist,
   *  - user clicks "play" button on an album.
   *  For any of these, if the item was already playing, but paused, it would not regenerate the playlist.
   * @param {playResponse}
   * @see Playlist#next
   */
  this.playNext = function(callback) {
    var apiUrl = "/api/v1/stream/next";
    lib.ajax(apiUrl,{},callback);
  };

  /**
   * play the previous song in the pre-computed playlist.
   * Unlike most "previous" buttons, does not restart the given song if already playing.
   * @param {playResponse}
   * @see Playlist#prev
   */
  this.playPrev = function(callback) {
    var apiUrl = "/api/v1/stream/prev";
    lib.ajax(apiUrl,{},callback);
  };

};

// instantiate it, put in a global var
var api = new ApiInterface();

/**
 * create a new clientside Lib object
 * @class
 * @classdesc this is a short library of useful functions, primarily Ajax.
 */
var Lib = function() {
  var self = this;

  /**
   * selectParent()
   * similar to jquery's closest() function,
   * the difference being that we are not chainable.
   * @param {Node} el - the element which has parents
   * @param {string} parentSelector - the CSS-style selector which will identify the parents we are searching for
   * @return {Node|boolean} An HTML node if if matches the parentSelector. Else false.
   */
  this.selectParent = function(el, parentSelector) {
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

  /**
   * template()
   * do Mustache-style templating on a string.
   * Note this is SUPER basic. Does not do nesting, loops, conditionals, etc.
   * Just simple {name}-value replacement.
   * @param {string} str - the string to search/replace IN
   * @param {Object} data - a flat object of key/value pairs to insert into the HTML string.
   * @returns {string} a full HTML with no more {key} blocks unless the corresponding data[key] did not exist.
   */
  this.template = function(str, data) {
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

  /** toDom()
   * convert a string into a fully build nodeList
   * @param {string} str - the string of correctly-formatted HTML
   * @return {NodeList} the HTML list of nodes
   */
  this.toDom = function(str) {
    var tmp = document.createElement("div");
    tmp.innerHTML = str;
    return tmp.childNodes;
  };

  /**
   * serialize()
   * take an object, output a string fit for the querystring.
   * @param {object} obj - the data object we wish to serialize.
   * @cite: http://stackoverflow.com/a/1714899/1525594
  */
  this.serialize = function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  };

  /**
   * a native Javascript ajax function.
   * Wraps XMLHttpRequest() with a url, data object, and a nice little callback.
   * @param {string} url - HTTP url to send request to
   * @param {Object} data - key/value pairs of GET or POST-type values to send
   * @param {ajaxResponse} callback - gets called with response from request
   * @param {string} method - one of "GET" or "POST"
   */
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

// instantiate it, put in a global var
lib = new Lib();

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
      // console.log("Socket is open!", ev);
    };
    self.socket.onmessage = function(dat) {
      var json = JSON.parse(dat.data);
      console.log("received message from websocket connection!", json);

      // handle app state changes
      switch(json.type) {
        case "playevent":

          // update the state
          self.setState(json.playstate);

          // update the footer "now playing" info
          self.foot.update();

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

  // call init to set up the footer
  this.init();
};

var app = new App();

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
    api.getTracks({},loadSongs);
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
    api.getAlbums({},loadAlbums);
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
    api.getArtists({},loadArtists);
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
        api.playAlbum(item.id, app.controls.playResponse);
        break;
      case "artist":
        // play all the songs for the particular artist
        api.playArtist(item.id, app.controls.playResponse);
        break;
      case "track":
        // play this particular song
        api.playTrack(item.id, app.controls.playResponse);
        break;
    }
  };


  this.pause = function(e) {
    item.classList.remove("active");
    playbutton.classList.add("fa-play");
    playbutton.classList.remove("fa-pause");
    api.pauseStream(item.id, function() {
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
  api.getTracks(opts, loadSongs);
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
  api.getTracks(opts, loadSongs);
};

// on initial page load, show all the songs
songTab.click();

// window event listeners - listen for clicks on the non-existent album or artist divs
window.addEventListener("click", loadSongsByX);

//# sourceMappingURL=app.js.map