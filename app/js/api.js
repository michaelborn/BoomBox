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
