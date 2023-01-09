var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var Jimp = require("jimp");
var imageStorage = require('./ImageStorage');

const checkJwt = require('./jwt-helper').checkJwt;
const UPLOAD = 'upload';

var storage = imageStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        var itemId = req.param('itemId');
        var newfilename = itemId + "-" + Math.floor(Date.now() / 1000) + "-" + file.originalname;
        cb(null, newfilename);
    }
})

var upload = multer({ storage: storage });

router.route(`/${UPLOAD}`)
    .post(upload.single('file'), function (req, res, err) {

        if(err!=null){
            console.log('upload error',err.message);
        }else{
            console.log('no upload error');
        }
        var itemId = req.param('itemId');
        console.log("itemId = " + itemId);
        return res.send("post...");
    })

router.route(`/${UPLOAD}/:product_id`)
    .get(checkJwt, function (req, res) {

        var path = 'uploads';

        var urls = new Array();

        fs.readdir(path, function (err, items) {

            for (var i = 0; items != null && i < items.length; i++) {
                if (items[i].startsWith(req.params.product_id)) {
                    var upload = {
                        "src": "/uploads/" + items[i] + "?t=" + new Date().getTime()
                    }
                    urls.push(upload);
                }
            }
            res.json(urls);
        });
    });

router.route(`/${UPLOAD}/rotate/:image/:direction`)
    .get(checkJwt, function (req, res) {

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

router.route(`/${UPLOAD}/delete/:image`)
    .delete(checkJwt, function (req, res) {
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
