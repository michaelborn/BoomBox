#!/usr/bin/env node

/**
 * This file currently uses node-acoustid to get the acoustid for each file.
 * I'll probably switch it to use node-groove, and then use groove for everything else while I'm at it.
 * Have node-groove fingerprint the files and save the retrieved metadata to the tags.
 * Then, my code will also save the important metadata in Mongo.
 * @cite: https://github.com/parshap/node-acoustid
 * @cite: https://github.com/andrewrk/node-groove
 */

var fs = require('fs')
    path = require('path')
    acoustid = require('acoustid'),
    audioDir = '../audio/',
    db = require('../init-mongo.js');

console.log(db);
var acoustIDer = {
  opts : {
    key: "y1QtljLfrL",
    meta: "recordings"
  },
  scan: function(filename, callback) {
    // Fingerprint the files using fpcalc,
    // then use node-acoustid to get the musicbrainz.org metadata
    // from the acoustid web service
    // https://github.com/parshap/node-acoustid
    // https://acoustid.org/webservice
    var self = this;
    acoustid(filename,self.opts,function(err,result) {
      if (err) {
        console.warn("Error getting music brainz metadata:",err);
        return false;
      }
      callback(err,result);
    });
  }
};

var testFilename = '../audio/01 - The Christmas Song (Merry Christmas to You).m4a';
console.log("Looking up filename: ",testFilename);
acoustIDer.scan(testFilename,function(err,result) {

      console.log("got result:",JSON.stringify(result,null,2));
});
/*

// get all files in the audio directory
fs.readdir(audioDir, function(err,filelist) {
  if (err) {
    console.warn("Error reading directory:",err);
    return false;
  }

  for (var i=0;i<filelist.length;i++) {
    if (fs.statSync(audioDir + filelist[i]).isDirectory()) {
      continue;
    }
    var fullFilename = audioDir + filelist[i];
    // TODO: Use node-musicnamer to move the files to /[artist]/[album]/filename.mp3.
    // https://github.com/bahamas10/node-musicnamer

    console.log("Looking up filename: ",fullFilename);

    acoustIDer.scan(fullFilename, function(err,result) {
      console.log("got result:",JSON.stringify(result,null,2));
    
    });
  }
});
*/
