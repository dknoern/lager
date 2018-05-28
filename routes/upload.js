var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var Jimp = require("jimp");
var Product = require('../models/product');
var imageStorage = require('./ImageStorage');
var sharp = require('sharp');

const checkJwt = require('./jwt-helper').checkJwt;

/*
router.use(function (req, res, next) {
    next();
});
*/
var storage = imageStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        var itemId = req.param('itemId');
        var newfilename = itemId + "_" + file.originalname;
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
