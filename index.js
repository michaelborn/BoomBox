#!/usr/bin/env node

var express = require("express"),
    app = express(),
    path = require("path"),
    mu2Express = require("mu2express"),
    exec = require("child_process").exec,
    https = require("https"),
    fs = require("fs"),
    db = require("./init-mongo.js");

var devices = Array();

var sOpts = {
  port: 8080,
  ip: "0.0.0.0",
  key: fs.readFileSync(path.join(__dirname, 'certstuff', 'certs', 'server', 'privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certstuff', 'certs', 'server', 'fullchain.pem'))
};

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

// SSL (or TLS???) certificate

// final server setup
console.log("Server");
server = https.createServer({ key: sOpts.key, cert: sOpts.cert },app);

//start the server
server.listen(sOpts.port, sOpts.ip, function() {
  console.log("..... listening on port ", sOpts.port);
});

// setup the websocket connection with HTTPS
var socketServer = require("ws").Server,
    wss = new socketServer({ server: server });
console.info("WebSocket");
console.info("...... listening on port ", sOpts.port);

// listen for a web socket connection from the user(s)
wss.on("connection", function(ws) {
  console.info("WebSocket connected!");

  // add the current web socket to the list of devices.
  // now we can send song info back to all devices
  devices.push(ws);

  //include all the routes for the API
  var api = require("./api/routes.js")(app, db, devices);

  // push and receive should go here
  // ws.send("bla");
  ws.on("message", function(msg) {
    console.log("received web socket message: ", msg);
  });
});

