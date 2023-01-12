var fs = require('fs')
var os = require('os')
var path = require('path')
var crypto = require('crypto')
var mkdirp = require('mkdirp')
var sharp = require('sharp')

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

  console.log('handing image storage');

  that.getDestination(req, file, function (err, destination) {
    if (err) return cb(err)

    that.getFilename(req, file, function (err, filename) {
      if (err) return cb(err)

      var finalPath = path.join(destination, filename);
      var outStream = fs.createWriteStream(finalPath);

      console.log('finalPath',finalPath);

        var transformer = sharp()
            .resize(2000,2000,{fit:'inside'})
            .on('info', function(info) {
                console.log('image resized to',info.width,'x',info.height);
            });
        file.stream.pipe(transformer).pipe(outStream);

        console.log('transformed');

        outStream.on('finish', function () {
            cb(null, {
                destination: destination,
                filename: filename,
                path: finalPath,
                size: outStream.bytesWritten
            })
        })
    })
  });

  console.log('done handing image storage');
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