#!/usr/bin/env node

var express = require("express"),
    app = express(),
    path = require("path"),
    mu2Express = require("mu2express"),
    exec = require("child_process").exec,
    db = require("./init-mongo.js"),
    wss = require("./websockets.js");

var sSettings = {
  port: 8080,
  ip: "0.0.0.0"
};

//include all the routes for the API
var api = require("./api/routes.js")(app, db);

//Include all the routes for our frontend web app
var web = require("./app/routes.js")(app, db);

//set up a templating engine
app.engine("mustache", mu2Express.engine);
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "app/views"));

// allow GET requests for static files in the /app folder.
app.use("/app", express.static(__dirname + "/app"));

// our main template
app.get("/", function(req, res) {
  res.render("main", {url:req.url});
});

// listen for a web socket connection from the user(s)
wss.on("connection", function(ws) {
  console.info("WebSocket connected!");

  // push and receive should go here
  // ws.send("bla");
  ws.on("message", function(msg) {
    console.log("received web socket message: ", msg);
  });
});

//start the server
console.log("Server");
app.listen(sSettings.port, sSettings.ip, function() {
  console.log("..... listening on port ", sSettings.port);
});
