var express = require('express');
var router = express.Router();

var Invoice = require('../models/invoice');
var LineItem = require('../models/lineItem');

var mongoose = require('mongoose');

router.route('/invoices')
    .post(function (req, res) {
        var invoice = new Invoice();

        invoice.customer  = req.body.customer;
        invoice.project = req.body.project;
        invoice.documentType = req.body.documentType;

        // TODO: iterate through line items if any and copy.

        var query = { _id: invoice._id };
        Invoice.findOneAndUpdate(query, invoice, { upsert: true }, function (err, doc) {
            if (err) return res.send(500, { error: err });
            return res.send("succesfully saved");
        });

    })

    .get(function (req, res) {

        Invoice.find(function (err, invoices) {
            if (err)
                res.send(err);

            res.json(invoices);
        });
    });

router.route('/invoices/:invoice_id')
    .get(function (req, res) {
        Invoice.findById(req.params.invoice_id, function (err, invoice) {
            if (err)
                res.send(err);
            res.json(invoice);
        });
    })

    .put(function (req, res) {
        Invoice.findById(req.params.invoice_id, function (err, invoice) {
            if (err)
                res.send(err);

            invoice.customer  = req.body.customer;
            invoice.project = req.body.project;
            invoice.invoiceNumber = req.body.invoiceNumber;
            invoice.documentType = req.body.documentType;

            invoice.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Invoice updated!'});
            });
        });
    })

    .delete(function (req, res) {
        Invoice.remove({
            _id: req.params.invoice_id
        }, function (err, invoice) {
            if (err)
                res.send(err);

            res.json({message: 'Successfully deleted'});
        });
    });

router.route('/invoices/:invoice_id/items')
    .post(function (req, res) {
        Invoice.findById(req.params.invoice_id, function (err, invoice) {
            if (err)
                res.send(err);

            var lineItem = new LineItem;
            lineItem.name = req.body.name;
            lineItem.amount = req.body.amount;

            invoice.lineItems.push(lineItem);

            invoice.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Invoice updated!'});
            });
        });
    })

module.exports = router;
