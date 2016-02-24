module.exports = function(app) {
  // a simple route - return hello world when a url is accessed.
  app.get('/', function(req, res) {
    res.render('home', {url:req.url});
  });

  return app;
};
