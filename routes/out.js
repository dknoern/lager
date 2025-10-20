var express = require('express');
var router = express.Router();
var Out = require('../models/out');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');
const { formatDate, formatDateTime } = require('./utils/date-utils');

// formatDate function moved to ./utils/date-utils.js

router.use(function (req, res, next) {
    next();
});

router.route('/outs')
    .post(checkJwt, function (req, res) {
        var out = new Out();
        out.date = new Date();
        out.sentTo = req.body.sentTo;
        out.description = req.body.description;
        out.comments = req.body.comments;
        out.user = req.body.user;

        out.search = (formatDate(new Date()) + " "
            + out.sentTo + " "
            + out.description + " "
            + out.comments).replace(/\s+/g, ' ').trim();

        if (req.body._id != null) {
            out._id = req.body._id;

            Out.findOneAndUpdate({
                _id: req.body._id
            },
                {
                    // don't update date
                    "$set": {
                        "sentTo": out.sentTo,
                        "description": out.description,
                        "user": out.user,
                        "comments": out.comments,
                        "search": out.search
                    }
                },
                {
                    upsert: false, useFindAndModify: false
                }, function (err, doc) {
                    if (err)
                        console.error('Error updating log out item:', err);

                    return res.send("Saved log out item");
                });

        } else {

            out.save(function (err, result) {
                if (err) {
                    console.error('Error saving log out:', err);
                }

                return res.send("sucessfully saved new log out entry ");
            });
        }

    })

    // get all log entries
    .get(checkJwt, function (req, res) {

        var draw = req.query.draw;
        var start = 0;
        var length = 10;

        if (req.query.start) start = req.query.start;
        if (req.query.length) length = req.query.length;

        var search = req.query.search.value;
        var results = {
            "draw": draw,
            "recordsTotal": 0,
            "recordsFiltered": 0,
            "data": []
        };

        var sortClause = { "date": -1 };

        Out.find({ 'search': new RegExp(search, 'i') }).
            sort(sortClause).skip(parseInt(start)).limit(parseInt(length))
            .exec(function (err, outs) {

                if (outs != null) {

                    for (var i = 0; i < outs.length; i++) {
                        results.data.push(
                            [
                                '<a href=\"/app/outs/' + outs[i]._id + '\"><div style="white-space: nowrap;">' + formatDateTime(outs[i].date) + '</div></a>',
                                outs[i].sentTo,
                                outs[i].description,
                                outs[i].user,
                                outs[i].comments
                            ]
                        );
                    }

                    Out.countDocuments({
                    }, function (err, count) {
                        results.recordsTotal = count;

                        if (search == '' || search == null) {
                            results.recordsFiltered = count;
                            res.json(results);
                        } else {
                            Out.countDocuments({
                                'search': new RegExp(search, 'i')
                            }, function (err, count) {
                                results.recordsFiltered = count;
                                res.json(results);
                            });
                        }
                    });
                }
            });
    });

// get specified 
router.route('/outs/:out_id')
    .get(checkJwt, function (req, res) {
        if (req.params.out_id) {
            Out.findById(req.params.out_id, function (err, log) {
                if (err) {
                    res.send(err);
                } else {
                    res.json(log);
                }
            });
        }
    });


// e-sign
router.route('/outs-sign')
    .post(checkJwt, function (req, res) {
        Out.findOneAndUpdate(
            { "_id": req.body.outId },
            {
                "$set": {
                    "signatureDate": Date.now(),
                    "signatureUser": req.user['http://mynamespace/name'],
                    "signature": req.body.signature
                }
            }, {
            "new": true,
            "upsert": false,
            "useFindAndModify": false
        }, function (err, doc) {
            if (err)
                res.send(err);
            res.json(doc);
        });
    });

module.exports = router;