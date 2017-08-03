var express = require('express');
var router = express.Router();

//var flowjs = require('flow')

router.use(function (req, res, next) {
    next();
});

router.route('/upload')
    .post(function (req, res) {
            return res.send("post...");
    })
    .put(function (req, res) {
            return res.send("put...");
    })
    .get(function (req, res) {
      return res.send("get...");
    });

module.exports = router;
