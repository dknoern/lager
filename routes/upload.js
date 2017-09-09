var express = require('express');
var multer = require( 'multer' );
var router = express.Router();

router.use(function (req, res, next) {
  next();
});


var upload = multer({dest: 'uploads/'});

router.route('/upload')
.post(upload.single('file'),function (req, res) {

  console.log("file uploaded");

  console.log("upload request: %j", req.file);
  return res.send("post...");
})
.put(function (req, res) {
  return res.send("put...");
})
.get(function (req, res) {
  return res.send("get...");
});

module.exports = router;
