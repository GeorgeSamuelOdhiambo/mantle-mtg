var express = require('express');
var router = express.Router();
var path = require('path');
var controllers = require("../controllers/pokemon")

router.get('/', function(req, res, next) {
  console.log(__dirname)
  res.sendFile(path.join(__dirname,'../', 'public','pokemon.html'));
});


router.get("/start-task", controllers.startTask);


module.exports = router;