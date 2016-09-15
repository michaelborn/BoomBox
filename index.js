#!/usr/bin/env node

var express = require('express'),
    app = express(),
    path = require('path'),
    mu2Express = require('mu2express'),
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    exec = require('child_process').exec,
    ObjectId = mongodb.ObjectID;

// this is stupid
global.mongodb = mongodb;
global.ObjectId = ObjectId;


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

// a simple route - return hello world when a url is accessed.
app.get('/', function(req, res) {
  res.render('main', {url:req.url});
});

// start mongodb database connection 
var url = 'mongodb://127.0.0.1:27017/test';
MongoClient.connect(url, function(err, db) {
  if (!err) { 
    console.log("Connected to Mongo on port 27017!");

    // Share the database to the global scope
    global.db = db;
    
    //start the server
    app.listen(8080, function() {
      console.log("Listening on port 8080!");
    });

  } else {
    console.log("Error connecting to MongoDB",arguments);
  }
});
