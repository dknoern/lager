var express = require('express');
var router = express.Router();
var Return = require('../models/return');
var mongoose = require('mongoose');
var history = require('./history');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

router.route('/returns')
    .post(checkJwt, function(req, res) {
        var ret = new Return();

        ret._id = req.body._id;
        ret.returnNumber = req.body.invoiceNumber;
        ret.invoiceId = req.body.invoiceId;
        ret.invoiceNumber = req.body.invoiceNumber;
        ret.customerName = req.body.customerName;
        ret.customerId = req.body.customerId;
        ret.date = new Date(req.body.date);
        ret.total = req.body.total;
        ret.salesPerson = req.body.salesPerson;
        ret.lineItems = req.body.lineItems;
        ret.subtotal = req.body.subtotal;
        ret.tax = req.body.tax;
        ret.shipping = req.body.shipping;
        ret.total = req.body.total;

        // use save for updates, findOne and update for inserts for now until we
        // figure out the problem with the "pre" in mongoose.
        if (ret.returnNumber == null || ret._id == "") {
            ret.save(function(err) {
                if (err)
                {
                    res.send(err);
                  }else{
                res.json({
                    message: 'return updated'
                });
              }
            });
        } else {
            var query = {
                _id: ret._id
            };
            Return.findOneAndUpdate(query, ret, {
                upsert: true
            }, function(err, doc) {
                if (err) return res.send(500, {
                    error: err
                });
                return res.send("return saved");
            });
        }

        console.log("calling updateProductHistory")


        // filter out non-included items
        var includedLineItems = new Array();
        for (var i = 0, len = req.body.lineItems.length; i < len; i++) {
            if (req.body.lineItems[i].included) {
                includedLineItems.push(req.body.lineItems[i]);
            }
        }

        history.updateProductHistory(includedLineItems, "AVAILABLE", "item returned", req.user['http://mynamespace/name']);

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

        Return.find({
            /*      'customer': new RegExp(search, 'i')

            $or: [{
                    'customer': new RegExp(search, 'i')
                },
                {
                    'lastName': new RegExp(search, 'i')
                }
            ]*/
        }, function(err, returns) {
            if (err)
                res.send(err);

            for (var i = 0; i < returns.length; i++) {
                results.data.push(
                    [
                        '<a href=\"/#/app/return/' + returns[i]._id + '\">' + returns[i]._id + '</a>',
                        returns[i].invoiceId,
                        format('yyyy-MM-dd', returns[i].returnDate),
                        returns[i].customerName,
                        returns[i].salesPerson,
                        "$" + returns[i].totalReturnAmount
                    ]
                );
            }

            Return.count({}, function(err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Return.count({
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
            _id: -1
        }).skip(parseInt(start)).limit(parseInt(length)).select({
            invoiceId: 1,
            returnDate: 1,
            customerName: 1,
            salesPerson: 1,
            totalReturnAmount: 1
        });

    });

router.route('/returns/:return_id')
    .get(checkJwt, function(req, res) {
        Return.findById(req.params.return_id, function(err, ret) {
            if (err)
                res.send(err);
            res.json(ret);
        });
    })

    .put(checkJwt, function(req, res) {
        Return.findById(req.params.return_id, function(err, ret) {
            if (err)
                res.send(err);

            ret.customerName = req.body.customerName;
            ret.returnNumber = req.body.returnNumber;

            ret.save(function(err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Return updated!'
                });
            });
        });
    })

router.route('/returns/:return_id/items')
    .post(checkJwt, function(req, res) {
        Return.findById(req.params.return_id, function(err, ret) {
            if (err)
                res.send(err);

            var lineItem = new LineItem;
            lineItem.name = req.body.name;
            lineItem.amount = req.body.amount;

            ret.lineItems.push(lineItem);

            ret.save(function(err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Return updated!'
                });
            });
        });
    })

router.route('/customers/:customer_id/returns')
    .get(checkJwt, function(req, res) {

        var customerId = req.params.customer_id;
        var query = Return.find({
            'customerId': customerId
        });

        query.select('customer date returnNumber customerId total');

        query.exec(function(err, returns) {
            if (err)
                res.send(err);

            res.json(returns);
        })
    });

module.exports = router;
