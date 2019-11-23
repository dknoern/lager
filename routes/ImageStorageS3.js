var fs = require('fs')
var os = require('os')
var path = require('path')
var crypto = require('crypto')
var mkdirp = require('mkdirp')
var sharp = require('sharp')

const stream = require('stream');

// load aws sdk
var aws = require('aws-sdk');

// load aws config
aws.config.loadFromPath('aws-credentials.js');


function getFilename (req, file, cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

function getDestination (req, file, cb) {
  cb(null, os.tmpdir())
}

function ImageStorage (opts) {
  this.getFilename = (opts.filename || getFilename)

  if (typeof opts.destination === 'string') {
    mkdirp.sync(opts.destination)
    this.getDestination = function ($0, $1, cb) { cb(null, opts.destination) }
  } else {
    this.getDestination = (opts.destination || getDestination)
  }
}

ImageStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  var that = this


  console.log("MIMETYPE: " + file.mimetype);
  
  that.getDestination(req, file, function (err, destination) {
    if (err) return cb(err)

    that.getFilename(req, file, function (err, filename) {
      if (err) return cb(err)

      var finalPath = path.join(destination, filename)

      var outStream = new stream.PassThrough();

      var transformer = sharp()
      .resize(1200,1200).max().withoutEnlargement()
      .on('info', function(info) {
          console.log('Image height is ' + info.height);
      });
  file.stream.pipe(transformer).pipe(outStream);

      var s3 = new aws.S3();
      var params = {Bucket: "dgktest2", Key: finalPath, Body: outStream, ContentType: file.mimetype,ACL: "public-read"};

      s3.upload(params, function(err, data) {
        console.log(err, data);
      });

        outStream.on('finish', function () {
            cb(null, {
                destination: destination,
                filename: filename,
                path: finalPath,
                size: outStream.bytesWritten
            })
        })






    })
  })
}

ImageStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  var path = file.path

  delete file.destination
  delete file.filename
  delete file.path

  fs.unlink(path, cb)
}

module.exports = function (opts) {
  return new ImageStorage(opts)
}