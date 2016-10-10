#!/usr/bin/env node

var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    mongojs = require('mongojs');

var dbUrl = "boombox",
    collections = ["tracks","artists","albums"],
    db = mongojs(dbUrl,collections);

module.exports = db;
