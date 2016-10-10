#!/usr/bin/env node

/**
 * This file uses python-discid to check the CD-rom
 * to see if the songs are catalogued in musicbrainz.org.
 *
 * @cite: https://github.com/mborn319/python-discid2
 * @cite: https://pypi.python.org/pypi/musicbrainzngs/0.6
 * @cite: https://github.com/bmc0/musicbrainz_discid
 * @cite: https://www.npmjs.com/package/python-shell
 * @cite: http://xiph.org/paranoia/
 */

var fs = require('fs')
    path = require('path')
    acoustid = require('acoustid'),
    db = require('../init-mongo.js'),
    pyShell = require('python-shell'),
    shell = require('child_process'),
    spawn = shell.spawn;

var collateResults = function(data) {
  /**
   * do any special formatting before we save the data to Mongo
   * loop through each track, append albumid
   * @returns {object} - artist, album, and tracks
   */
  var trackList = data["medium-list"][0]["track-list"],
      artist = {
        _id: data["artist-credit"][0]["artist"]["id"],
        name: data["artist-credit"][0]["artist"]["name"]
      },
      album = {
        _id: data["id"],
        title: data["title"],
        date: data["date"],
        track_count:data["medium-list"][0]["track-count"]
      };

  // add the foreign key ids 
  // note these IDs come all the way from musicbrainz.org!!
  // http://musicbrainz.org/artist/6e0ae159-8449-4262-bba5-18ec87fa529f
  for (var i=0;i<trackList.length;i++) {
    // first, we "guess" at the track filename.
    // it's an intelligent guess because we know the file extension
    // and the track number / order number.
    // hopefully this never breaks, but it could,
    // which would result in track X being associated with
    // the metadata for track X+-1.
    trackList[i]["filename"] = getTrackFilename(trackList[i]);

    // "flatten" the recording object into the track
    trackList[i]["title"] = trackList[i]["recording"]["title"];
    trackList[i]["recording_id"] = trackList[i]["recording"]["id"];
    delete trackList[i]["recording"];

    // add album id foreign key for Mongo
    trackList[i].albumid = album["_id"]

    // add artist id foreign key for Mongo
    trackList[i].artistid = artist["_id"]

    // make sure we have a proper mongodb id
    trackList[i]["_id"] = trackList[i]["id"];
    delete trackList[i]["id"];
  }

  return { artist: artist, album: album, tracks: trackList };
};
var getTrackFilename = function(track) {
  var typical = "track[number].cdda.wav",
    trackNum = getTrackNumLeadingZero(track.number);
  return typical.replace(/\[number\]/,trackNum);
};
var getUniqueDirectory = function(artist, album) {
  // put the new directory together,
  // making sure to strip bad characters to avoid bad paths
  var typical = "audio/wav/[artist]/[album]/",
      artistName = getCleanFilename(artist),
      albumTitle = getCleanFilename(album);

  typical = typical.replace(/\[artist\]/,artistName);
  typical = typical.replace(/\[album\]/,albumTitle);

  return typical;
};
var getTrackNumLeadingZero = function(num) {
    return num < 10 ? "0" + num : num;
};
var getCleanFilename = function(filename) {
  var tmp = filename.replace(/[^-a-zA-Z0-9]/g,"-");
  return tmp.replace(/--/g,'-');
};

/**
 * send the artist, album, and track info to Mongo.
 * Currently, if the document already exists, it is not updated.
 * @param tracks - array of disc tracks with artistid and albumid foreign keys
 * @param album - object with id, title, track_count
 * @param artist - object with id, name
 */
var saveToMongo = function(artist,album,tracks) {
  // save artist to mongo's "artists" collection
  db.artists.insert(artist);
  // save album to mongo's "albums" collection
  db.albums.insert(album);
  // duh
  db.tracks.insert(tracks);
};

/**
 * Begin the cd analyzing using libdiscid
 * and musicbrainz_discid.py.
 *
 * @cite: https://github.com/mborn319/python-discid2
 * @cite: https://pypi.python.org/pypi/musicbrainzngs/0.6
 * @cite: https://github.com/bmc0/musicbrainz_discid
 * @cite: https://www.npmjs.com/package/python-shell
 */
pyShell.run('musicbrainz_discid/discid_json.py', {}, function(err,results) {
  if (err) {
    if (err.exitCode === 1) {
      console.error("Can't find audio metadata. Please ensure there is an audio disc in the CD tray.");
    } else {
      console.error("Got error from musicbrainz_discid:",err);
    }
    return false;
  }  else {
    // success, start ripping the cd songs

    /**
     * begin the cd ripping process using cdparanoia
     * Note we can include an integer argument 
     * which signals that we only want a particular track number.
     * This is quite useful for debugging, as it speeds up wait times.
     *
     * @cite: http://xiph.org/paranoia/
     */
    cdripper = spawn("cdparanoia",["-B"]);
    
    // output to standard output -
    // this probably means a song has been successfully saved to disk
    cdripper.stdout.on("data",function(data) {
      console.log("cdparanoia stdout:",data);
    });

    // output to standard error
    cdripper.stderr.on("data",function(data) {
      //console.log("cdparanoia stderr:",data);
    });

    // cdparanoia is done!
    cdripper.on("close",function(code) {
      // properly organize the data before sending to Mongo
      var data = JSON.parse(results)[0],
          script = [],
          mongoData = collateResults(data);
      //console.log("cdparanoia done, exit code ", code);

      // console.log("Got CD metadata: ",mongoData);
      
      // unique directory for this artist/album combo
      newDir = getUniqueDirectory(mongoData.artist.name,mongoData.album.title);
      console.log("saving files to:",newDir);

      // update track filenames with full pathname
      mongoData.tracks.map(function(item) {
        item.filename = newDir + item.filename;
        return item;
      });

      // send to mongo
      saveToMongo(mongoData.artist,mongoData.album,mongoData.tracks);

      // Make the new directory in the /audio/wav directory
      script.push("mkdir -p ../" + newDir);

      // move the .wav files to the new directory
      script.push("mv *.wav ../" + newDir);

      // eject the CD tray, just cuz we can.
      script.push("eject");

      // put our shell command together,
      // join multiple statements with a semicolon.
      runCmd = script.join(";");

      // run everything
      shell.exec(runCmd,{},function() {
        console.log("DONE! CD ejected and files moved to correct directory.");
      });
    });
  }

});
