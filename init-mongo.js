#!/usr/bin/env node

var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    mongojs = require('mongojs');

var db = mongojs("test")
module.exports = db;


