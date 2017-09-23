var express = require('express');
var router = express.Router();

var Invoice = require('../models/invoice');

var mongoose = require('mongoose');

router.route('/invoices')
    .post(function(req, res) {
        var invoice = new Invoice();

        invoice._id = req.body._id;
        invoice.invoiceNumber = req.body.invoiceNumber;
        invoice.customer = req.body.customer;
        invoice.customerId = req.body.customerId;
        invoice.project = req.body.project;
        invoice.date = req.body.date;
        invoice.shipVia = req.body.shipVia;
        invoice.paidBy = req.body.paidBy;
        invoice.total = req.body.total;
        invoice.methodOfSale = req.body.methodOfSale;
        invoice.salesPerson = req.body.salesPerson;
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

        var customerId = req.query.customerId;

        if (!customerId) {

            Invoice.find(function(err, invoices) {
                if (err)
                    res.send(err);
                res.json(invoices);
            });

        } else {

            var query = Invoice.find({ 'customerId': customerId });
            //var query = Invoice.find({ 'customer': 'Beth Johanssen' });

            // selecting the 'name' and 'age' fields
            query.select('customer date invoiceNumber customerId total');

            // limit our results to 5 items
            //query.limit(5);

            // sort by age
            //query.sort({ age: -1 });

            // execute the query at a later time
            query.exec(function (err, invoices) {
              if (err)
                  res.send(err);

              res.json(invoices);
            })
        }
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

module.exports = router;
