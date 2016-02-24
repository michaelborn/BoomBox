module.exports = function(app) {
  // a simple route - return hello world when a url is accessed.
  app.get('/api/track', function(req, res) {
    //return tracks!
  });

  return app;
};
