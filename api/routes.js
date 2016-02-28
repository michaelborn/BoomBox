module.exports = function(app) {
  var api_version_str = "/api/v1";

  // Routes for getting, creating, updating, and deleting song tracks by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/track', function(req, res) {
    //return tracks!
  });
  app.post(api_version_str+'/track', function(req, res) {
    //insert tracks!
  });
  app.put(api_version_str+'/track', function(req, res) {
    //update tracks!
  });
  app.delete(api_version_str+'/track', function(req, res) {
    //delete tracks!
  });

  // Routes for getting, creating, updating, and deleting song artists by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/artist', function(req, res) {
    //return artists!
  });
  app.post(api_version_str+'/artist', function(req, res) {
    //create artists!
  });
  app.put(api_version_str+'/artist', function(req, res) {
    //create artists!
  });
  app.delete(api_version_str+'/artist', function(req, res) {
    //delete artists!
  });

  // Routes for getting, creating, updating, and deleting song albums by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/album', function(req, res) {
    //return albums!
  });
  app.post(api_version_str+'/album', function(req, res) {
    //create albums!
  });
  app.put(api_version_str+'/album', function(req, res) {
    //update albums!
  });
  app.delete(api_version_str+'/album', function(req, res) {
    //delete albums!
  });
  return app;
};
