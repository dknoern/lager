var express = require('express');
var router = express.Router();
var Repair = require('../models/repair');
var history = require('./history');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');
const config = require('../config');

var mustache = require("mustache");
var fs = require("fs");

const formatCurrency = require('format-currency');

// load AWS SDK v3
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// create SES client
const ses = new SESClient({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
    }
});

function formatDate(date) {
    if (date == null) return "";
    else {
        return format('yyyy-MM-dd  hh:mm', date);
    }
}

function isEmpty(str) {
    return (!str || str.length === 0 );
}

router.route('/repairs')
    .post(checkJwt, function (req, res) {

        const newRepair = (req.body._id == null);
        var repair = new Repair();

        if (newRepair) {
            console.log('creating new repair, repairNumber', req.body.repairNumber);
        } else {
            repair._id = req.body._id;
            console.log('updating existing repair', repair._id, 'repairNumber', req.body.repairNumber);
        }

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

        if (!isEmpty(repair.itemNumber) && !isEmpty(repair.itemNumber) && repair.repairNumber != repair.itemNumber) {
            return res.send(500, {
                error: "for inventory item, repair number must match item number"
            }
            );
        }

        else {
            console.log('saving repair', repair.repairNumber);
            repair.search = repair.repairNumber + " " + repair.itemNumber + " " + repair.description + " " + formatDate(repair.dateOut)
                + " " + formatDate(repair.expectedReturnDate) + " " + formatDate(repair.returnDate)
                + " " + repair.customerFirstName + " " + repair.customerLastName + " " + repair.vendor;

            Repair.findOneAndUpdate({
                _id: repair._id
            }, repair, {
                new: true, upsert: true, useFindAndModify: false
            }, function (err, doc) {
                if (err) {
                    return res.send(500, {
                        error: err
                    });

                } else {
                    if (newRepair) {
                        var action = "in repair";
                        if (repair.vendor != null) {
                            action += " - " + repair.vendor;
                        }

                        history.updateProductHistory([{ productId: repair.itemId }], "Repair", action, req.user['http://mynamespace/name'], doc._id);
                    }
                }

                const message = 'repair ' + doc._id + ' saved';
                console.log(message);

                return res.send(message);
            });
        }
    })

    .get(checkJwt, function(req, res) {

        var repairNumber = req.query.repairNumber;

        if (repairNumber != null) {
            Repair.findOne({'repairNumber': repairNumber}, '_id description customerFirstName customerLastName itemNumber', function (err, repair) {
                res.json(repair);
            });
            return;
        }

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
            var now = new Date();
            now.setFullYear(now.getFullYear()-2);
            var agedOutString = format('yyyy-MM-dd',now);
            query.$and.push({dateOut:{$gt:agedOutString}});
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
                        '<a href=\"#\" onclick=\"selectRepair(\'' + repairs[i]._id + '\');return false;\">' + repairs[i].repairNumber + '</a>',
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
                    Repair.countDocuments(
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
                fs.readFile('./src/app/modules/repair/repair-content.html', 'utf-8', function (err, template) {
                    if (err) throw err;
                    var output = mustache.to_html(template, {
                        data: repair,
                        tenantAddress: config.tenant.address,
                        tenantCity: config.tenant.city,
                        tenantState: config.tenant.state,
                        tenantZip: config.tenant.zip,
                        tenantPhone: config.tenant.phone,
                        tenantFax: config.tenant.fax,
                        tenantAppRoot: config.tenant.appRoot
                
                    });
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

        var from = config.tenant.email;

        Repair.findById(req.body.repairId, function (err, repair) {
                if (err) {
                    res.send(err);

                    return "Error formatting repair";
                }
                else {
                    fs.readFile('./src/app/modules/repair/repair-content.html', 'utf-8', function (err, template) {
                        if (err) throw err;
                        var output =
                            "<p>" + req.body.note + " </p>" + mustache.to_html(template, {
                                data: repair,
                                tenantAddress: config.tenant.address,
                                tenantCity: config.tenant.city,
                                tenantState: config.tenant.state,
                                tenantZip: config.tenant.zip,
                                tenantPhone: config.tenant.phone,
                                tenantFax: config.tenant.fax,
                                tenantAppRoot: config.tenant.appRoot
                            });
                        const command = new SendEmailCommand({
                                Source: from,
                                Destination: {
                                    ToAddresses: to
                                },
                                Message: {
                                    Subject: {
                                        Data: `${config.tenant.name} Repair`
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
                            });

                        ses.send(command)
                            .then(data => {
                                console.log('Email sent:');
                                console.log(data);
                            })
                            .catch(err => {
                                console.error('Error sending email:', err);
                                throw err;
                            });
                    });
                }
            }
        );

        res.json("ok");
    });

module.exports = router;
