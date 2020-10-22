var express = require('express');
var router = express.Router();
var Repair = require('../models/repair');
var Product = require('../models/product');
var history = require('./history');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

var emailAddresses = require('../email-addresses.js');

var mustache = require("mustache");
var fs = require("fs");

const formatCurrency = require('format-currency');

// load aws sdk
var aws = require('aws-sdk');

// load aws config
aws.config.loadFromPath('aws-credentials.js');

// load AWS SES
var ses = new aws.SES({
    apiVersion: '2010-12-01'
});

// send to list
var to = emailAddresses.to;
var bcc = emailAddresses.bcc;


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
        history.updateProductHistory([{productId: repair.itemId}], "Repair", action, req.user['http://mynamespace/name'],null);

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
        repair.warrantyService = req.body.warrantyService;
        repair.repairCost = req.body.repairCost;
        repair.customerApprovedDate = req.body.customerApprovedDate;


        if(repair.itemNumber!=null&&repair.itemNumber!=""&&repair.repairNumber!=null&&repair.repairNumber!="" && repair.repairNumber!=repair.itemNumber){
            return res.send(500, {
                error: "for inventory item, repair number must match item number"
            }
            );

        }

        else {


            console.log('saving repair ' + repair.repairNumber);
            repair.search = repair.repairNumber + " " + repair.itemNumber + " " + repair.description + " " + formatDate(repair.dateOut)
                + " " + formatDate(repair.expectedReturnDate) + " " + formatDate(repair.returnDate)
                + " " + repair.customerFirstName + " " + repair.customerLastName + " " + repair.vendor;


            upcertRepair(req, res, repair);


            // update repair cost in item
            /*
            if (repair.itemNumber != null) {
                Product.findOneAndUpdate({
                    _id: repair.itemId
                }, {
                    "$set": {
                        "repairCost": repair.repairCost
                    }
                }, {
                    upsert: true
                }, function (err, doc) {
                    if (err)
                        console.log(err);
                    else
                        console.log("repair cost updated");
                });
            }
            */

        }
    })

    .get(checkJwt, function(req, res) {

        var draw = req.query.draw;
        var start = 0;
        var length = 10;
        if (req.query.start) start = req.query.start;
        if (req.query.length) length = req.query.length;
        var search = req.query.search.value;

        var query = { $and: [{'search': new RegExp(search, 'i')}] };

        var opts = { format: '%s%v', symbol: '$' };

        if("outstanding"==req.query.filter){
            query.$and.push({returnDate:{$eq:null}});
       }

        var results = {
            "draw": draw,
            "recordsTotal": 0,
            "recordsFiltered": 0,
            "data": []
        };

        Repair.find(
            query
        , function(err, repairs) {
            if (err)
                res.send(err);

            for (var i = 0; i < repairs.length; i++) {


                var customerName = "";
                if (repairs[i].customerFirstName) customerName += repairs[i].customerFirstName;
                if (repairs[i].customerFirstName && repairs[i].customerLastName) customerName += " ";
                if (repairs[i].customerLastName) customerName += repairs[i].customerLastName;

                var formattedRepairCost = "";
                if(repairs[i].repairCost!=null){
                    formattedRepairCost = formatCurrency(repairs[i].repairCost,opts);
                }

                results.data.push(
                    [
                        '<a href=\"/#/app/repair/' + repairs[i]._id + '\">' + repairs[i].repairNumber + '</a>',
                        repairs[i].itemNumber,
                        repairs[i].description,
                        '<div style="white-space: nowrap;">' + formatDate(repairs[i].dateOut)+'</div>',
                        '<div style="white-space: nowrap;">' + formatDate(repairs[i].customerApprovedDate)+'</div>',
                        '<div style="white-space: nowrap;">' + formatDate(repairs[i].returnDate)+'</div>',
                        customerName,
                        repairs[i].vendor,
                        formattedRepairCost
                    ]
                );
            }

            Repair.estimatedDocumentCount({}, function(err, count) {
                results.recordsTotal = count;

                if ((search == '' || search == null)&&"all"==req.query.filter) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Repair.estimatedDocumentCount(
                        query
                    , function(err, count) {

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
            customerApprovedDate: 1,
            returnDate: 1,
            customerFirstName: 1,
            customerLastName: 1,
            repairNumber: 1,
            repairCost: 1,
            itemNumber: 1,
            vendor: 1
        });
    });




router.route('/repairs/:repair_id/print')
//  .get(checkJwt, function(req, res) {
    .get( function(req, res) {


        var opts = { format: '%s%v', symbol: '$' };

        Repair.findById(req.params.repair_id, function(err, repair) {
            if (err) {
                res.send(err);
            }
            else {

                /*

                if (invoice.invoiceType == "Memo") invoice.logo = "http://demesyinventory.com/assets/images/logo/memo-logo.png";
                else invoice.logo = "http://demesyinventory.com/assets/images/logo/invoice-logo.png";

                invoice.subtotalFMT = formatCurrency(invoice.subtotal, opts);
                invoice.taxFMT = formatCurrency(invoice.tax, opts);
                invoice.shippingFMT = formatCurrency(invoice.shipping, opts);
                invoice.totalFMT = formatCurrency(invoice.total, opts);
                invoice.dateFMT =  format('MM/dd/yyyy', invoice.date);

                console.log("shipping: "+ invoice.shipping + " formatted "+ invoice.shippingFMT);




                for (var i = 0; i < invoice.lineItems.length; i++) {

                    invoice.lineItems[i].nameFMT = invoice.lineItems[i].name.toUpperCase();
                    invoice.lineItems[i].amountFMT = formatCurrency(invoice.lineItems[i].amount, opts);
                    invoice.lineItems[i].itemNumberFMT = invoice.lineItems[i].itemNumber+ format('dd', invoice.date);
                }
                */

                fs.readFile('./src/app/modules/repair/repair-content.html', 'utf-8', function (err, template) {
                    if (err) throw err;
                    var output = mustache.to_html(template, {data: repair});
                    res.send(output);
                });



            }

        });
    });





router.route('/repairs/:repair_id')
 .get(checkJwt, function(req, res) {
        Repair.findById(req.params.repair_id, function(err, ret) {
            if (err)
                res.send(err);
            res.json(ret);
        });
    });


router.route('/repairs/products/:item_id')
 .get(checkJwt, function(req, res) {

        Repair.find({itemId:req.params.item_id}, function(err, ret) {
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

                    history.updateProductHistory([{productId: repair.itemId}], "In Stock", "back from repair", req.user['http://mynamespace/name'],null);


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







router.route('/repairs/email')
    .post(checkJwt, function(req, res) {

        var to = req.body.emailAddresses.split(/[ ,\n]+/);

        console.log("emailing repair " + req.body.invoiceId + " to " + JSON.stringify(to));


        var from = 'sales@info.demesyinventory.com';

        Repair.findById(req.body.repairId, function (err, repair) {
                if (err) {
                    res.send(err);

                    return "Error formatting repair";
                }
                else {
                    fs.readFile('./src/app/modules/repair/repair-content.html', 'utf-8', function (err, template) {
                        if (err) throw err;
                        var output =
                            "<p>" + req.body.note + " </p>" + mustache.to_html(template, {data: repair});
                        ses.sendEmail({
                                Source: from,
                                Destination: {
                                    ToAddresses: to,
                                    BccAddresses: bcc
                                },
                                Message: {
                                    Subject: {
                                        Data: 'DeMesy Repair'
                                    },
                                    Body: {
                                        Text: {
                                            Data: 'repair can only be viewed using HTML-capable email browser'
                                        },
                                        Html: {
                                            Data: output
                                        }
                                    }
                                }
                            }
                            , function (err, data) {
                                if (err) throw err
                                console.log('Email sent:');
                                console.log(data);
                            });
                    });
                }
            }
        );




        res.json("ok");

    });






module.exports = router;
