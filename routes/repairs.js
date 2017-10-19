var express = require('express');
var router = express.Router();
var Repair = require('../models/repair');
var mongoose = require('mongoose');
var history = require('./history');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

router.route('/repairs')
    .post(checkJwt, function(req, res) {
        var repair = new Repair();

        repair._id = req.body._id;
        repair.dateOut = req.body.dateOut;
        repair.expectedReturnDate = req.body.expectedReturnDate;
        repair.returnDate = req.body.returnDate;
        repair.itemNumber = req.body.itemNumber;
        repair.description = req.body.description;
        repair.repairIssues = req.body.repairIssues;
        repair.repairNotes = req.body.repairNotes;
        repair.vendor = req.body.vendor;
        repair.customerName = req.body.customerName;
        repair.phone = req.body.phone;
        repair.email = req.body.email;
        repair.productId = req.body.productId;
        repair.customerId = req.body.customerId;


            var query = {
                _id: repair._id
            };
            Repair.findOneAndUpdate(query, repair, {
                upsert: true
            }, function(err, doc) {
                if (err) return res.send(500, {
                    error: err
                });
                return res.send("repair saved");
            });


        console.log("calling updateProductHistory")

        var lineItems = new Array();
        var lineItem = {
          productId: repair.productId
        }

        history.updateProductHistory(lineItems,"REPAIR","in repair",req.user['http://mynamespace/name']);
    })

    .get(function(req, res) {

        var query = "";
        var draw = req.query.draw;
        var start = 0;
        var length = 10;
        if (req.query.start) start = req.query.start;
        if (req.query.length) length = req.query.length;
        var search = req.query.search.value;
        console.log('search string is ' + search);

        var results = {
            "draw": draw,
            "recordsTotal": 0,
            "recordsFiltered": 0,
            "data": []
        };

        Repair.find({
            /*      'customer': new RegExp(search, 'i')

            $or: [{
                    'customer': new RegExp(search, 'i')
                },
                {
                    'lastName': new RegExp(search, 'i')
                }
            ]*/
        }, function(err, repairs) {
            if (err)
                res.send(err);

            for (var i = 0; i < repairs.length; i++) {
                results.data.push(
                    [
                        '<a href=\"/#/app/repair/' + repairs[i]._id + '\">' + repairs[i]._id + '</a>',
                        repairs[i].description,
                        format('yyyy-MM-dd', repairs[i].dateOut),
                        format('yyyy-MM-dd', repairs[i].expectedReturnDate),
                        repairs[i].customerName,
                        repairs[i].vendor
                    ]
                );
            }

            Repair.count({}, function(err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Repair.count({
                        'customer': new RegExp(search, 'i')
                        /*$or: [{
                                'firstName': new RegExp(search, 'i')
                            },
                            {
                                'lastName': new RegExp(search, 'i')
                            },
                            {
                                'city': new RegExp(search, 'i')
                            },
                            {
                                'state': new RegExp(search, 'i')
                            },
                            {
                                'phone': new RegExp(search, 'i')
                            },
                            {
                                'email': new RegExp(search, 'i')
                            },
                            {
                                'company': new RegExp(search, 'i')
                            }
                        ]*/
                    }, function(err, count) {

                        results.recordsFiltered = count;
                        res.json(results);
                    });
                }
            });

        }).sort({
            dateOut: -1
        }).skip(parseInt(start)).limit(parseInt(length)).select({
            description: 1,
            dateOut: 1,
            expectedReturnDate: 1,
            customerName: 1,
            vendor: 1
        });

    });

router.route('/repairs/:repair_id')
    .get(checkJwt, function(req, res) {
        Repair.findById(req.params.repair_id, function(err, ret) {
            if (err)
                res.send(err);
            res.json(ret);
        });
    })

    .put(checkJwt, function(req, res) {
        Repair.findById(req.params.repair_id, function(err, repair) {
            if (err)
                res.send(err);

            repair.customer = req.body.customer;
            repair.returnNumber = req.body.returnNumber;

            repair.save(function(err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Repair updated!'
                });
            });
        });
    })



module.exports = router;
