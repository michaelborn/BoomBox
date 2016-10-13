var Api = function() {
  /**
   * api.js - this file does all the data interaction with the BoomBox API
   * this is purposely designed to match the API endpoints
   */
  this.songs = {};
  this.albums = {};
  this.artists = {};
  this.stream = {};
  this.stream.track = {};
  this.stream.album = {};
  this.stream.artist = {};

  this.songs.get = function(opts,callback) {
    var data = opts;
    lib.ajax("/api/v1/track",data,callback,"GET");
  };
  this.songs.insert = function(opts) {
    // we may not need to insert tracks through the frontend.
  };

  // streaming endpoints
  this.pause = function(callback) {
    lib.ajax("/api/v1/stream/pause",{},callback,"GET");
  };
  this.play = function(type, callback) {
    var allowedStreamTypes = ["track","album","artist"];
    if (allowedStreamTypes.indexOf(type) == -1) {
      throw "Stream play type must be one of: " + allowedStreamTypes;
    }

    var apiUrl = "/api/v1/stream/" + type + "/play/" + id;
    lib.ajax(apiUrl,{},callback,"GET");
  };

  // track streaming endpoints
  this.stream.track.play = function(id,callback) {
    this.play("track",id,callback);
  };
  this.stream.album.play = function(id,callback) {
    this.play("album",id,callback);
  };
  this.stream.artist.play = function(id,callback) {
    this.play("artist",id,callback);
  };

};
var api = new Api();
