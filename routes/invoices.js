var express = require('express');
var router = express.Router();
var Invoice = require('../models/invoice');
var Product = require('../models/product');
var mongoose = require('mongoose');
var history = require('./history');
var format = require('date-format');

const checkJwt = require('./jwt-helper').checkJwt;

router.route('/invoices')
    .post(checkJwt, function(req, res) {
        var invoice = new Invoice();

        invoice._id = req.body._id;
        invoice.invoiceNumber = req.body.invoiceNumber;
        invoice.customerName = req.body.customerName;
        invoice.customerId = req.body.customerId;
        invoice.project = req.body.project;
        invoice.date = new Date(req.body.date);
        invoice.shipVia = req.body.shipVia;
        invoice.paidBy = req.body.paidBy;
        invoice.total = req.body.total;
        invoice.methodOfSale = req.body.methodOfSale;
        invoice.salesPerson = req.body.salesPerson;

        //if(invoice.salesPersion==null||invoice.salesPerson.length==0)
        //  invoice.salesPerson = eq.user['http://mynamespace/name'];

        invoice.invoiceType = req.body.invoiceType;
        invoice.shipToName = req.body.shipToName;
        invoice.shipAddress1 = req.body.shipAddress1;
        invoice.shipAddress2 = req.body.shipAddress2;
        invoice.shipAddress3 = req.body.shipAddress3;
        invoice.shipCity = req.body.shipCity;
        invoice.shipState = req.body.shipState;
        invoice.shipZip = req.body.shipZip;
        invoice.lineItems = req.body.lineItems;
        invoice.subtotal = req.body.subtotal;
        invoice.tax = req.body.tax;
        invoice.shipping = req.body.shipping;
        invoice.total = req.body.total;

        var itemStatus = "Sold";
        var itemAction = "sold item";

        if("Memo" == invoice.invoiceType)
        {
          itemStatus = "Memo";
          itemAction = "item memo"
        }

        history.updateProductHistory(req.body.lineItems, itemStatus, itemAction, req.user['http://mynamespace/name']);

        // use save for updates, findOne and update for inserts for now until we
        // figure out the problem with the "pre" in mongoose.
        if (invoice._id == null || invoice._id == "") {
            invoice.save(function(err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'invoice updated'
                });
            });
        } else {
            var query = {
                _id: invoice._id
            };
            Invoice.findOneAndUpdate(query, invoice, {
                upsert: true
            }, function(err, doc) {
                if (err) return res.send(500, {
                    error: err
                });
                return res.send("invoice saved");
            });
        }
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

        Invoice.find({
            /*      'customer': new RegExp(search, 'i')

            $or: [{
                    'customer': new RegExp(search, 'i')
                },
                {
                    'lastName': new RegExp(search, 'i')
                }
            ]*/
        }, function(err, invoices) {
            if (err)
                res.send(err);

            for (var i = 0; i < invoices.length; i++) {

                var itemNo = "";
                var itemName = "";
                if(invoices[i].lineItems!=null && invoices[i].lineItems.length>0 ){
                  itemNo = invoices[i].lineItems[0].productId ;
                  itemName = invoices[i].lineItems[0].name ;
                }
                results.data.push(
                    [
                        '<a href=\"/#/app/invoice/' + invoices[i]._id + '\">' + invoices[i]._id + '</a>',
                        invoices[i].customerName,
                        format('yyyy-MM-dd', invoices[i].date),
                        itemNo,
                        itemName,
                        invoices[i].total
                    ]
                );
            }

            Invoice.count({}, function(err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Invoice.count({
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
            customerName: 1,
            date: 1,
            lineItems: 1,
            total: 1
        });

    });

router.route('/invoices/:invoice_id')
    .get(checkJwt, function(req, res) {
        Invoice.findById(req.params.invoice_id, function(err, invoice) {
            if (err)
                res.send(err);
            res.json(invoice);
        });
    })

    .put(checkJwt, function(req, res) {
        Invoice.findById(req.params.invoice_id, function(err, invoice) {
            if (err)
                res.send(err);

            invoice.customer = req.body.customer;
            invoice.project = req.body.project;
            invoice.invoiceNumber = req.body.invoiceNumber;
            invoice.documentType = req.body.documentType;

            invoice.save(function(err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Invoice updated!'
                });
            });
        });
    })

    .delete(checkJwt, function(req, res) {
        Invoice.remove({
            _id: req.params.invoice_id
        }, function(err, invoice) {
            if (err)
                res.send(err);

            res.json({
                message: 'Successfully deleted'
            });
        });
    });

module.exports = router;
