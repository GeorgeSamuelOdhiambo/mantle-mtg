var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var controllers = require("../controllers/index")
var multipartMiddleware = multipart();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/file', controllers.getFiles);
router.get("/file/:fileName", controllers.downloadFile);

router.post("/file/upload",multipartMiddleware, controllers.uploadMagicFile);

router.post("/file/upload-pricing",multipartMiddleware, controllers.uploadTCGPricingFile);

module.exports = router;
