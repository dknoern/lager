var express = require('express');
var multer = require( 'multer' );
var router = express.Router();
var fs = require('fs');

const checkJwt = require('./jwt-helper').checkJwt;

router.use(function (req, res, next) {
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    var itemId = req.param('itemId');
    var newfilename = itemId + "_" + file.originalname ;
    cb(null, newfilename); //Appending .ext
  }
})

var upload = multer({storage: storage});

router.route('/upload')
.post(upload.single('file'),function (req, res) {

 var itemId = req.param('itemId');
    console.log("itemId = " + itemId);
  return res.send("post...");
})

.put(function (req, res) {
  return res.send("put...");
})
.get(function (req, res) {
  return res.send("get...");
});

router.route('/upload/:product_id')
.get(function (req, res){

  var path = 'uploads';

    var urls = new Array();

  fs.readdir(path, function(err, items) {

      for (var i=0; items!=null && i<items.length; i++) {
          if(items[i].startsWith(req.params.product_id))
          {
            urls.push("/uploads/"+items[i]);
          }
      }
      res.json(urls);
  });

});

module.exports = router;
