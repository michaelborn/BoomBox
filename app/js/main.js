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
  var songTemplate = '<div class="list-item" id="{_id}" data-type="track"><div class="track__info"><h4 class="title">{title}</h4><h5 class="artist__name">{artist.name}</h5></div><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';

  app.tracks = json;
  if (typeof window.localStorage === "object") {
    localStorage.setItem("tracks", JSON.stringify(json));
  }

  // for each song, append the artist name
  if (app.artists.length) {
    for (var i=0; i < json.length; i++) {
      // for each stored artist, check the id against the current track.artistid
      thisArtist = app.getTrackById(json[i].artistid);
      if (thisArtist) {
        json[i]["artist.name"] = thisArtist.name;
      }
    }
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
  console.log(artistTitle);

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
