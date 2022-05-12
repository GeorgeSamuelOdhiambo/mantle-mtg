var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var path = require('path');
var controllers = require("../controllers/yughio")
var multipartMiddleware = multipart();

router.get('/', function(req, res, next) {
  console.log(__dirname)
  res.sendFile(path.join(__dirname,'../', 'public','yughio.html'));
});

router.post("/file/upload",multipartMiddleware, controllers.uploadYughioFile);

/* router.get("/status", controllers.getStatus);
router.get("/start-task", controllers.startTask);
router.post("/config", controllers.updateConfig); */

module.exports = router;
