module.exports = function(app) {
  // Routes for getting, creating, updating, and deleting song tracks by ID.
  // ID is required for all except GET.
  app.get('/api/track', function(req, res) {
    //return tracks!
  });
  app.post('/api/track', function(req, res) {
    //insert tracks!
  });
  app.put('/api/track', function(req, res) {
    //update tracks!
  });
  app.delete('/api/track', function(req, res) {
    //delete tracks!
  });

  // Routes for getting, creating, updating, and deleting song artists by ID.
  // ID is required for all except GET.
  app.get('/api/artist', function(req, res) {
    //return artists!
  });
  app.post('/api/artist', function(req, res) {
    //create artists!
  });
  app.put('/api/artist', function(req, res) {
    //create artists!
  });
  app.delete('/api/artist', function(req, res) {
    //delete artists!
  });

  // Routes for getting, creating, updating, and deleting song albums by ID.
  // ID is required for all except GET.
  app.get('/api/album', function(req, res) {
    //return albums!
  });
  app.post('/api/album', function(req, res) {
    //create albums!
  });
  app.put('/api/album', function(req, res) {
    //update albums!
  });
  app.delete('/api/album', function(req, res) {
    //delete albums!
  });
  return app;
};
