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
    lib.ajax("/api/v1/track",data,callback,"GET");
  };
  /*
  self.songs.insert = function(opts) {
    // we may not need to insert tracks through the frontend.
  };
  */
  self.albums.get = function(opts, callback) {
    var data = opts;
    lib.ajax("/api/v1/album",data,callback,"GET");
  };
  self.artists.get = function(opts, callback) {
    var data = opts;
    lib.ajax("/api/v1/artist",data,callback,"GET");
  };

  // streaming endpoints
  self.pause = function(callback) {
    lib.ajax("/api/v1/stream/pause",{},callback,"GET");
  };
  self.play = function(type, id, callback) {
    var allowedStreamTypes = ["track","album","artist"];
    if (allowedStreamTypes.indexOf(type) == -1) {
      throw "Stream play type must be one of: " + allowedStreamTypes;
    }
    if (typeof callback !== "function") {
      throw "Callback is required.";
    }

    var apiUrl = "/api/v1/stream/" + type + "/" + id;
    lib.ajax(apiUrl,{},callback,"GET");
  };

  // track streaming endpoints
  self.stream.track.play = function(id,callback) {
    self.play("track",id,callback);
  };
  self.stream.album.play = function(id,callback) {
    self.play("album",id,callback);
  };
  self.stream.artist.play = function(id,callback) {
    self.play("artist",id,callback);
  };

};
var api = new Api();
