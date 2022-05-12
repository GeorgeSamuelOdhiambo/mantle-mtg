var express = require('express');
var router = express.Router();
var path = require('path');
var controllers = require("../controllers/yughio")

router.get('/', function(req, res, next) {
  console.log(__dirname)
  res.sendFile(path.join(__dirname,'../', 'public','yughio_images.html'));
});

//router.get("/status", controllers.getStatus);
router.get("/start-task", controllers.startTImageTask);
//router.post("/config", controllers.updateConfig);

module.exports = router;
