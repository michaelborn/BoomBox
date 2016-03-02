var express = require('express'),
    app = express(),
    path = require('path'),
    mu2Express = require("mu2express");

// a simple route - return hello world when a url is accessed.
app.get('/', function(req, res) {
  res.render('main', {url:req.url});
});


//include all the routes for the API
var api = require('./api/routes.js')(app);

//Include all the routes for our frontend web app
var web = require('./app/routes.js')(app);

//set up a templating engine
app.engine('mustache', mu2Express.engine);
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'app/views'));

//start the server
app.listen(8080, function() {
  console.log("Listening on port 8080!");
});
