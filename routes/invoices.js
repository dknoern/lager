var express = require('express');
var router = express.Router();

var Invoice = require('../models/invoice');
var LineItem = require('../models/lineItem');

var mongoose = require('mongoose');


router.route('/invoices')
    .post(function(req, res) {
        var invoice = new Invoice();

        invoice._id = req.body._id;
        invoice.invoiceNumber = req.body.invoiceNumber;
        invoice.customer = req.body.customer;
        invoice.project = req.body.project;
        invoice.date = req.body.date;
        invoice.shipVia = req.body.shipVia;
        invoice.paidBy = req.body.paidBy;
        invoice.total = req.body.total;
        invoice.paymentId = req.body.paymentId;
        invoice.salesPerson = req.body.salesPerson;
        invoice.invoiceType = req.body.invoiceType;
        invoice.shipToName = req.body.shipToName;
        invoice.shipAddress1 = req.body.shipAddress1;
        invoice.shipAddress2 = req.body.shipAddress2;
        invoice.shipAddress3 = req.body.shipAddress3;
        invoice.shipCity = req.body.shipCity;
        invoice.shipState = req.body.shipState;
        invoice.shipZip = req.body.shipZip;

        /*
                if(!invoiceNumber || invoiceNumber==""){
                  getNextSequence("userid"),
                }
        */
        console.log("salesperson = " + invoice.salesPerson);

        // TODO: iterate through line items if any and copy.


        // use save for updates, findOne and update for inserts for now until we
        // figure out the problem with the "pre" in mongoose.
        if (invoice.invoiceNumber == null || invoice._id == "") {
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

        Invoice.find(function(err, invoices) {
            if (err)
                res.send(err);

            res.json(invoices);
        });
    });

router.route('/invoices/:invoice_id')
    .get(function(req, res) {
        Invoice.findById(req.params.invoice_id, function(err, invoice) {
            if (err)
                res.send(err);
            res.json(invoice);
        });
    })

    .put(function(req, res) {
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

    .delete(function(req, res) {
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

router.route('/invoices/:invoice_id/items')
    .post(function(req, res) {
        Invoice.findById(req.params.invoice_id, function(err, invoice) {
            if (err)
                res.send(err);

            var lineItem = new LineItem;
            lineItem.name = req.body.name;
            lineItem.amount = req.body.amount;

            invoice.lineItems.push(lineItem);

            invoice.save(function(err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Invoice updated!'
                });
            });
        });
    })

module.exports = router;
