var express = require('express');
var router = express.Router();
var Repair = require('../models/repair');
var Product = require('../models/product');
var mongoose = require('mongoose');
var Counter = require('../models/counter');
var history = require('./history');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');



function formatDate(date) {
    if (date == null) return "";
    else {
        return format('yyyy-MM-dd', date);
    }
}

function upcertRepair(req,res, repair){
    if(req.body._id ==null) {
        var action = "in repair";
        if(repair.vendor != null){
            action += " - " + repair.vendor;
        }
        history.updateProductHistory([{productId: repair.itemId}], "Repair", action, req.user['http://mynamespace/name']);

        repair.save(function(err) {
            if (err) {
                res.send(err);
            }
            return res.send("repair saved");
        });

    } else {

        console.log("repair_.id is NOT null");

        Repair.findOneAndUpdate({
            _id: repair._id
        }, repair, {
            upsert: true
        }, function(err, doc) {
            if (err) return res.send(500, {
                error: err
            });
            return res.send("repair saved");
        });
    }
}

router.route('/repairs')
    .post(checkJwt, function(req, res) {
    //.post( function(req, res) {
        var repair = new Repair();

        console.log("setting repair_id from body: " + req.body._id);
        console.log("existing id is : " + repair._id);

        repair._id = req.body._id;


        console.log("after setting, repair._id = " + repair._id);

        repair.dateOut = req.body.dateOut;
        repair.expectedReturnDate = req.body.expectedReturnDate;
        repair.returnDate = req.body.returnDate;
        repair.itemNumber = req.body.itemNumber;
        repair.repairNumber = req.body.repairNumber;
        repair.itemId = req.body.itemId;
        repair.description = req.body.description;
        repair.repairIssues = req.body.repairIssues;
        repair.repairNotes = req.body.repairNotes;
        repair.vendor = req.body.vendor;
        repair.customerFirstName = req.body.customerFirstName;
        repair.customerLastName = req.body.customerLastName;
        repair.phone = req.body.phone;
        repair.email = req.body.email;
        repair.customerId = req.body.customerId;
        repair.hasPapers = req.body.hasPapers;
        repair.repairCost = req.body.repairCost;


        repair.search = repair.repairNumber + " " + repair.itemNumber + " " + repair.description + " " + formatDate(repair.dateOut)
            + " " + formatDate(repair.expectedReturnDate) + " " + formatDate(repair.returnDate)
            + " " + repair.customerFirstName + " " + repair.customerLastName + " " + repair.vendor;


        if(repair.itemNumber==null){
            // increment repairNumber
            Counter.findByIdAndUpdate({
                _id: 'repairNumber'
            }, {
                $inc: {
                    seq: 1
                }
            }, function(err, counter) {
                if (err) {
                    console.log(err);
                    return res.send(500, {
                        error: err
                    });
                }

                repair.repairNumber=counter.seq;
                upcertRepair(req,res,repair);
            });

        } else {
            //use itemNumber as repair number
            repair.repairNumber = repair.itemNumber;
            upcertRepair(req,res,repair);
        }


        // update repair cost in item
        if(repair.itemNumber!=null){
            Product.findOneAndUpdate({
                _id: repair.itemId
            }, {"$set": {
                    "totalRepairCost": repair.repairCost
            }}, {
                upsert: true
            }, function(err, doc) {
                if (err)
                    console.log(err);
                else
                    console.log("repair cost updated");
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

        Repair.find({

            'search': new RegExp(search, 'i')

        }, function(err, repairs) {
            if (err)
                res.send(err);

            for (var i = 0; i < repairs.length; i++) {


                var customerName = "";
                if (repairs[i].customerFirstName) customerName += repairs[i].customerFirstName;
                if (repairs[i].customerFirstName && repairs[i].customerLastName) customerName += " ";
                if (repairs[i].customerLastName) customerName += repairs[i].customerLastName;

                results.data.push(
                    [
                        '<a href=\"/#/app/repair/' + repairs[i]._id + '\">' + repairs[i].repairNumber + '</a>',
                        repairs[i].itemNumber,
                        repairs[i].description,
                        '<div style="white-space: nowrap;">' + formatDate(repairs[i].dateOut)+'</div>',
                        '<div style="white-space: nowrap;">' + formatDate(repairs[i].expectedReturnDate)+'</div>',
                        '<div style="white-space: nowrap;">' + formatDate(repairs[i].returnDate)+'</div>',
                        customerName,
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
                        'search': new RegExp(search, 'i')
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
            returnDate: 1,
            customerFirstName: 1,
            customerLastName: 1,
            repairNumber: 1,
            repairCost: 1,
            itemNumber: 1,
            vendor: 1
        });
    });


router.route('/repairs/:repair_id')
// .get(checkJwt, function(req, res) {
    .get(function(req, res) {
        Repair.findById(req.params.repair_id, function(err, ret) {
            if (err)
                res.send(err);
            res.json(ret);
        });
    });


router.route('/repairs/:repair_id/return')
    .put(checkJwt, function(req, res) {
        Repair.findById(req.params.repair_id, function(err, repair) {
            if (err)
                res.send(err);

            if(repair.returnDate==null){
                console.log('return date was null, setting to now');
                repair.returnDate = new Date();
                repair.save(function(err) {
                    if (err)
                        res.send(err);

                    history.updateProductHistory([{productId: repair.itemId}], "In Stock", "back from repair", req.user['http://mynamespace/name']);


                    res.json({
                        message: 'Repair updated!'
                    });
                });
            }else{
                res.json({
                    message: 'Repair was already returned'
                });
            }
        });
    });

module.exports = router;
