//main.js - This file does all the app-ish stuff. Includes buttons, animations, and possibly offline functionality.


// Buttons!
var settingsBtn = document.getElementById("btnSettings"),
    searchBtn = document.getElementById("btnSearch"),
    songTab = document.getElementById("tab__songs"),
    artistTab = document.getElementById("tab__artists"),
    albumTab = document.getElementById("tab__albums");


// the "Songs" tab in the app nav
songTab.addEventListener("click",function(e) {
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


  // load data into page
  albumTab.classList.remove("active");
  artistTab.classList.remove("active");
  songTab.classList.add("active");
});

// the "Albums" tab in the app nav
albumTab.addEventListener("click",function(e) {
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

  // load data into page
  songTab.classList.remove("active");
  artistTab.classList.remove("active");
  albumTab.classList.add("active");
});

// the "Artists" tab in the app nav
artistTab.addEventListener("click",function(e) {
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


  // load data into page
  songTab.classList.remove("active");
  albumTab.classList.remove("active");
  artistTab.classList.add("active");
});

// Data
// here we set up the loading of song lists, album lists, artist lists, etc.
var dataBox = document.getElementById("app-data");


var openSettings = function() {
  document.getElementById("app-settings").classList.toggle("open");
};


// events
// here we set up all the button click events
settingsBtn.addEventListener("click",openSettings);

// Get songs
var loadSongs = function(json) {
  var songTemplate = '<div class="list-item" id="{_id}" data-type="track"><div class="media"><img src="{imgsrc}" alt="{title}" /></div><div class="track__info"><h4 class="title">{title}</h4><h5 class="artist__name">{artist.name}</h5></div><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';

  app.tracks = json;
  if (typeof window.localStorage === "object") {
    localStorage.setItem("tracks", JSON.stringify(json));
  }

  // for each song, append the artist name
  if (app.artists.length) {
    for (var i=0; i < json.length; i++) {
      for (var n=0; n < app.artists.length; n++) {
        // for each stored artist, check the id against the current track.artistid
        if (app.artists[n]._id === json[i].artistid) {
          // set the artist name
          json[i]["artist.name"] = app.artists[n].name;
        }
      }
    }
  }

  return loadItems(json,songTemplate);
};
var loadArtists = function(json) {
  var songTemplate = '<div class="list-item" id="{_id}" data-type="artist"><div class="media"><img src="{imgsrc}" alt="{name}" /></div><h4 class="title">{name}</h4><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';

  app.artists = json;
  if (typeof window.localStorage === "object") {
    localStorage.setItem("artists", JSON.stringify(json));
  }

  return loadItems(json,songTemplate);
};
var loadAlbums = function(json) {
  var songTemplate = '<div class="list-item" id="{_id}" data-type="album"><div class="media"><img src="{albumart}" alt="{title}" /></div><h4 class="title">{title}</h4><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';

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
    //console.log("song:",song);
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
        console.log("play: this album's songs");
        api.stream.album.play(item.id, app.controls.playResponse);
        break;
      case "artist":
        // play all the songs for the particular artist
        console.log("play: this artist's songs");
        api.stream.artist.play(item.id, app.controls.playResponse);
        break;
      case "track":
        // play this particular song
        console.log("play: this particular song");
        api.stream.track.play(item.id, app.controls.playResponse);
        break;
    }
  };


  this.pause = function(e) {//console.log("pause!",e,item);
    item.classList.remove("active");
    playbutton.classList.add("fa-play");
    playbutton.classList.remove("fa-pause");
    api.pause(item.id, function() {
      console.log("Whoa... it's paused!?",arguments);
    });
  };

  this.toggle = function(e) {//console.log("toggle!",e,item);
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

// on initial page load, show all the songs
songTab.click();
