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
    self.playStream("track",id,callback);
  };

  /**
   * play a certain album, given its id
   * @param {string} id - the unique id of the album we wish to listen to
   * @param {playResponse} callback - result of the play action
   * @see Playlist#play
   */
  this.playAlbum = function(id,callback) {
    self.playStream("album",id,callback);
  };

  /**
   * play all songs by a certain artist, given its id
   * @param {string} id - the unique id of the artist we wish to listen to
   * @param {playResponse} callback - result of the play action
   * @see Playlist#play
   */
  this.playArtist = function(id,callback) {
    self.playStream("artist",id,callback);
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
