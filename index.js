var express = require('express'),
    app = express(),
    path = require('path'),
    mu2Express = require("mu2express"),
    MongoClient = require('mongodb').MongoClient;


//include all the routes for the API
var api = require('./api/routes.js')(app);

//Include all the routes for our frontend web app
var web = require('./app/routes.js')(app);

//set up a templating engine
app.engine('mustache', mu2Express.engine);
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'app/views'));

// allow GET requests for static files in the /app folder.
app.use('/app', express.static(__dirname + '/app'));

// log requests made AFTER this module is loaded
// app.use(logger());


// a simple route - return hello world when a url is accessed.
app.get('/', function(req, res) {
  res.render('main', {url:req.url});
});

// start mongodb database connection 
var url = 'mongodb://127.0.0.1';
MongoClient.connect(url, function(err, db) {
  if (err !== null) { 
    console.log("Mongodb started correctly");
//
    ////now get the tracks, artists, and albums collections
    //var tracks = db.collection("tracks");
    //var albums = db.collection("albums");
    //var artists= db.collection ("artists");
       //
    //start the server
    app.listen(8080, function() {
      console.log("Listening on port 8080!");
    });

  } else {
    console.log("Error connecting to MongoDB",arguments);
  }
});
