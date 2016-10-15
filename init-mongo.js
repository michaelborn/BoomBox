#!/usr/bin/env node

var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    mongojs = require('mongojs');

console.info("Mongo");

var dbUrl = "boombox",
    collections = ["tracks","artists","albums"],
    db = mongojs(dbUrl,collections);

module.exports = db;
console.info("...... using database:", dbUrl);
console.info("...... using collections:", collections);
