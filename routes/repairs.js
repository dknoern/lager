var express = require('express');
var router = express.Router();

var Repair = require('../models/repair');

var mongoose = require('mongoose');

var history = require('./history');

const checkJwt = require('./jwt-helper').checkJwt;

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

    .get(checkJwt, function(req, res) {

        var customerId = req.query.customerId;

        if (!customerId) {

            Repair.find(function(err, returns) {
                if (err)
                    res.send(err);
                res.json(returns);
            });

        } else {

            var query = Repair.find({
                'customerId': customerId
            });

            // selecting the 'name' and 'age' fields
            query.select('customer dateOut expectedReturnDate customerId description');

            // limit our results to 5 items
            //query.limit(5);

            // sort by age
            //query.sort({ age: -1 });

            // execute the query at a later time
            query.exec(function(err, returns) {
                if (err)
                    res.send(err);

                res.json(returns);
            })
        }
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
