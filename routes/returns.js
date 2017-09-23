var express = require('express');
var router = express.Router();

var Return = require('../models/return');

var mongoose = require('mongoose');

router.route('/returns')
    .post(function(req, res) {
        var ret = new Return();

        ret._id = req.body._id;
        ret.returnNumber = req.body.invoiceNumber;
        ret.invoiceId = req.body.invoiceId;
        ret.invoiceNumber = req.body.invoiceNumber;
        ret.customer = req.body.customer;
        ret.customerId = req.body.customerId;
        ret.date = req.body.date;
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
                    res.send(err);
                res.json({
                    message: 'return updated'
                });
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
    })

    .get(function(req, res) {

        var customerId = req.query.customerId;

        if (!customerId) {

            Return.find(function(err, returns) {
                if (err)
                    res.send(err);
                res.json(returns);
            });

        } else {

            var query = Return.find({ 'customerId': customerId });

            // selecting the 'name' and 'age' fields
            query.select('customer date returnNumber customerId total');

            // limit our results to 5 items
            //query.limit(5);

            // sort by age
            //query.sort({ age: -1 });

            // execute the query at a later time
            query.exec(function (err, returns) {
              if (err)
                  res.send(err);

              res.json(returns);
            })
        }
    });

router.route('/returns/:return_id')
    .get(function(req, res) {
        Return.findById(req.params.return_id, function(err, ret) {
            if (err)
                res.send(err);
            res.json(ret);
        });
    })

    .put(function(req, res) {
        Return.findById(req.params.return_id, function(err, ret) {
            if (err)
                res.send(err);

            ret.customer = req.body.customer;
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
    .post(function(req, res) {
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

module.exports = router;
