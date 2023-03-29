var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Product = require('../models/product');
var Log = require('../models/log');
var Repair = require('../models/repair');
var Log = require('../models/log');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

function formatDate(date) {
    if (date == null) return "";
    else {
        return format('yyyy-MM-dd', date);
    }
}

router.use(function (req, res, next) {
    next();
});

router.route('/logs')
    // post new log entry
    .post(checkJwt, function (req, res) {
        var log = new Log();
        log.date = new Date();
        log.receivedFrom = req.body.receivedFrom;
        log.comments = req.body.comments;
        log.user = req.body.user;
        log.customerName = req.body.customerName;
        log.lineItems = req.body.lineItems;

        log.search = (formatDate(new Date()) + " "
            + log.receivedFrom + " "
            + log.customerName + " "
            + log.lineItems.map(function (k) { return k.name }).join(",") + " "
            + log.lineItems.map(function (k) { return k.repairNumber }).join(" ") + " "
            + log.comments).replace(/\s+/g, ' ').trim();

        if (req.body._id != null) {
            log._id = req.body._id;

            Log.findOneAndUpdate({
                _id: req.body._id
            }, 
            {
                // don't update date
                "$set": {
                    "receivedFrom": log.receivedFrom,
                    "customerName": log.customerName,
                    "user": log.user,
                    "comments": log.comments,
                    "lineItems": log.lineItems
                }
            },
            {
                upsert: false, useFindAndModify:false
            }, function (err, doc) {
                if (err) 
                    console.log('error updating log item',err);
                else
                    console.log('updated existing log item successfully');

                return res.send("Saved log item");
            });

            log.lineItems.forEach(lineItem => {
                updateRepairDetails(lineItem, log.comments);
            });
        } else {

            log.save(function (err, result) {
                if (err) {
                    console.log('error saving log: ' + err);
                }
                log.lineItems.forEach(lineItem => {

                    if (lineItem.productId != null) {
                        console.log("update product", lineItem.itemNumber);
                        receiveProduct(log, lineItem);
                    }
                    closeRepair(lineItem, log.comments);
                });


                console.log("sucessfully saved new log entry", result._id);
                return res.send("sucessfully saved new log entry ");
            });
        }


    })

    // get all log entries
    .get(function (req, res) {

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

        Log.find({ 'search': new RegExp(search, 'i') }).
            sort(sortClause).skip(parseInt(start)).limit(parseInt(length))
            .exec(function (err, logs) {

                if (logs == null) {
                    console.log("no log items found");
                }

                else {

                    for (var i = 0; i < logs.length; i++) {
                        results.data.push(
                            [
                                '<a href=\"#\" onclick=\"selectLog(\'' + logs[i]._id + '\');return false;\"><div style="white-space: nowrap;">' + format('yyyy-MM-dd hh:mm', logs[i].date) + '</div></a>',
                                logs[i].receivedFrom,
                                logs[i].customerName,
                                logs[i].lineItems.map(function (k) { return k.name }).join(","),
                                logs[i].lineItems.map(function (k) { return k.itemNumber }).join(" "),
                                logs[i].lineItems.map(function (k) { return k.repairNumber }).join(" "),
                                logs[i].user,
                                logs[i].comments
                            ]
                        );
                    }

                    Log.countDocuments({
                    }, function (err, count) {
                        results.recordsTotal = count;

                        if (search == '' || search == null) {
                            results.recordsFiltered = count;
                            res.json(results);
                        } else {
                            Log.countDocuments({
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
router.route('/logs/:log_id')
    .get(checkJwt, function (req, res) {

        if (req.params.log_id) {
            Log.findById(req.params.log_id, function (err, log) {
                if (err) {
                    res.send(err);
                } else {
                    res.json(log);
                }
            });
        }
    });


function receiveProduct(log, lineItem) {
    Product.findById(lineItem.productId, ['status', 'history'], function (err, product) {

        // replay events to figure out current status
        var sold = false;
        var repair = false;
        var memo = false;

        product.history.forEach(element => {

            if (element.action == 'sold item') {
                sold = true;
            } else if (element.action == 'item returned') {
                sold = false;
            } else if (element.action == 'in repair') {
                repair = true;
            } else if (element.action == 'item memo') {
                memo = true;
            } else if (element.action == 'received') {
                if (repair) {
                    repair = false;
                } else {
                    sold = false; // cant be both sold and memoed
                    memo = false;
                }
            }
            console.log("action = ", element.action, "sold = ", sold, "repair = ", repair, "memo = ", memo);

        });

        // figure out new state for received item

        var newStatus = product.status;

        // item could be in repair even if sold or memoed
        if (repair) {
            if(sold){
                newStatus = "Sold";
            } else if(memo) {
                newStatus = "Memo";
            } else {
                newStatus = "In Stock";
            }
        } else {
            newStatus = "In Stock";
        }

        console.log("checking existing product in, status was " + product.status + ", setting status to " + newStatus);
        var updates = {
            "lastUpdated": Date.now(),
            "status": newStatus
        };

        //TODO: update total repair cost maybe?... will now calculate on display only.

        // ---------------------------------
        // create new history item and product status
        // ---------------------------------
        Product.findOneAndUpdate({
            _id: lineItem.productId
        }, {

            "$push": {
                "history": {
                    user: log.user,
                    date: Date.now(),
                    action: "received",
                    itemReceived: lineItem.name,
                    receivedFrom: log.receivedFrom,
                    repairNumber: lineItem.repairNumber,
                    customerName: log.customerName,
                    comments: log.comments,
                    repairCost: log.repairCost,
                    refDoc: log._id
                }
            },
            "$set": updates
        }, {
            upsert: true, useFindAndModify: false
        }, function (err, doc) {
            if (err) 
                console.log('error adding history',err);
                else
                console.log('added history line',doc._id,'for itemNumber',lineItem.itemNumber);
        });
    });
}

function closeRepair(lineItem, comments) {
    console.log('marking repairs for repairId', lineItem.repairId, 'or productId', lineItem.productId);

    Repair.updateMany(
        {


            $and: [
                { returnDate: { $eq: null } },
                {
                    $or: [
                        {
                            _id: lineItem.repairId // _id never null
                        },
                        {
                            $and: [
                                { itemId: lineItem.productId },
                                { itemId: { $ne: null } } // itemId could be null if not inventory item
                            ]
                        }
                    ]
                }

            ]
        },
        {
            returnDate: new Date(),
            repairCost: lineItem.repairCost,
            repairNotes: comments
        }, function (err, doc) {
            if (err) {
                console.log(err)
            }
            else {
                console.log('closed', doc.nModified, 'repairs for repairId', lineItem.repairId, 'or productId', lineItem.productId);
            }
        });
}


function updateRepairDetails(lineItem, comments) {
    console.log('updating repair details for repairId', lineItem.repairId, 'or productId', lineItem.productId);

    Repair.updateMany(
        {
            _id: lineItem.repairId
        },
        {
            repairCost: lineItem.repairCost,
            repairNotes: comments
        }, function (err, doc) {
            if (err) {
                console.log(err)
            }
            else {
                console.log('updated', doc.nModified, 'repairs for repairId', lineItem.repairId, 'or productId', lineItem.productId);
            }
        });
}


module.exports = router;