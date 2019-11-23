var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var Jimp = require("jimp");
var Product = require('../models/product');
var imageStorage = require('./ImageStorageS3');

const checkJwt = require('./jwt-helper').checkJwt;


// load aws sdk
var aws = require('aws-sdk');

// load aws config
aws.config.loadFromPath('aws-credentials.js');



var storage = imageStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        var itemId = req.param('itemId');
        var newfilename = itemId + "/" + Math.floor(Date.now() / 1000) + "-" + file.originalname;
        cb(null, newfilename); //Appending .ext
    }
})

var upload = multer({storage: storage});

router.route('/upload')
    .post(upload.single('file'), function (req, res) {

        var itemId = req.param('itemId');
        console.log("itemId = " + itemId);
        return res.send("post...");
    })


router.route('/upload/:product_id')
    .get(checkJwt,function (req, res) {


        var urls = new Array();

        var s3 = new aws.S3();

        var params = {
            Bucket: "dgktest2", 
            Prefix: "uploads/" + req.params.product_id +"/",
            MaxKeys: 40
           };
           s3.listObjects(params, function(err, data) {
             if (err) console.log(err, err.stack); // an error occurred
             else     console.log(data);           // successful response

             for (var i = 0; data!=null && data.Contents!=null && data.Contents != null && i < data.Contents.length; i++) {
       
                    var upload = {
                        "src": "/api/upload/" + data.Contents[i].Key
                    }
                    urls.push(upload);
            }
            res.json(urls);
    

           });
    });


    router.route('/upload/uploads/:product_id/:image_id')
    .get(function (req, res) {

        console.log("loading image from s3: "+  req.params.product_id +"/" + req.params.image_id );
    });

    router.route('/upload/uploads/:product_id/:image_id')
    .get(function (req, res) {

        aws.get('/image/' + req.params.id)
        .on('error', next)
        .on('response', function (resp) {
          if (resp.statusCode !== 200) {
            var err = new Error()
            err.status = 404
            next(err)
            return
          }
      
          res.setHeader('Content-Length', resp.headers['content-length'])
          res.setHeader('Content-Type', resp.headers['content-type'])
      
          // cache-control?
          // etag?
          // last-modified?
          // expires?
      
          if (req.fresh) {
            res.statusCode = 304
            res.end()
            return
          }
      
          if (req.method === 'HEAD') {
            res.statusCode = 200
            res.end()
            return
          }
      
          resp.pipe(res)
        })
      })






router.route('/upload/rotate/:image/:direction')
    .get(checkJwt,function (req, res) {

        var image = req.params.image;
        var direction = req.params.direction;

        var angle = 90;

        if (direction == 'left') {
            angle = -90;
        }

        var filename = 'uploads/' + image;

        console.log("rotating file " + filename);

        Jimp.read(filename).then(function (img) {
            img.rotate(angle)
                .write(filename);
            res.send(filename);

        }).catch(function (err) {
            console.error(err);
        });
    });

router.route('/upload/delete/:image')
    .delete(checkJwt,function (req, res) {
        var path = 'uploads';
        var image = req.params.image;
        console.log("deleting file " + image);

        fs.unlink(path + "/" + image, function (err) {
            if (err) {
                res.status(500).json('unable to delete file: ' + err)
            } else {
                res.json("deleted file");
            }
        });

    });
module.exports = router;
