var express = require('express');
var db = require('../data/db.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Hex FM API');
});

module.exports = router;
