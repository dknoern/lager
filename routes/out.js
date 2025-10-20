var express = require('express');
var router = express.Router();
var Out = require('../models/out');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');
const { formatDate, formatDateTime } = require('./utils/date-utils');
const { parseDataTablesRequest, handleDataTablesQuery, sendDataTablesResponse } = require('./utils/datatables-helper');

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
        const params = parseDataTablesRequest(req);
        
        const transformRow = (out) => {
            return [
                '<a href="/app/outs/' + out._id + '"><div style="white-space: nowrap;">' + formatDateTime(out.date) + '</div></a>',
                out.sentTo,
                out.description,
                out.user,
                out.comments
            ];
        };
        
        const queryPromise = handleDataTablesQuery(Out, params, {
            baseQuery: {},
            searchField: 'search',
            sortClause: { date: -1 },
            transformRow
        });
        
        sendDataTablesResponse(res, queryPromise);
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