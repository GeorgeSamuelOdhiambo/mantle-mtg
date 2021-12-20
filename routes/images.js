var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function(req, res, next) {
  console.log(__dirname)
  res.sendFile(path.join(__dirname,'../', 'public','images.html'));
});

module.exports = router;
