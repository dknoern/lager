var express = require('express');
var router = express.Router();
var Repair = require('../models/repair');
var history = require('./history');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');
const config = require('../config');

const formatCurrency = require('format-currency');
const { formatDateTime } = require('./utils/date-utils');
const { isEmpty } = require('./utils/validation-utils');
const { sendTemplatedEmail, parseEmailAddresses } = require('./utils/email-utils');
const { parseDataTablesRequest, handleDataTablesQueryWithEstimatedCount, sendDataTablesResponse } = require('./utils/datatables-helper');

// Utility functions moved to shared utilities

router.route('/repairs')
    .post(checkJwt, function (req, res) {

        const newRepair = (req.body._id == null);
        var repair = new Repair();

        if (!newRepair) {
            repair._id = req.body._id;
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
            repair.search = repair.repairNumber + " " + repair.itemNumber + " " + repair.description + " " + formatDateTime(repair.dateOut)
                + " " + formatDateTime(repair.expectedReturnDate) + " " + formatDateTime(repair.returnDate)
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

                return res.send('repair ' + doc._id + ' saved');
            });
        }
    })

    .get(checkJwt, function (req, res) {

        var repairNumber = req.query.repairNumber;

        if (repairNumber != null) {
            Repair.findOne({ 'repairNumber': repairNumber }, '_id description customerFirstName customerLastName itemNumber', function (err, repair) {
                res.json(repair);
            });
            return;
        }

        const params = parseDataTablesRequest(req);
        const opts = { format: '%s%v', symbol: '$' };
        
        // Build base query with optional outstanding filter
        let baseQuery = {};
        if ("outstanding" == req.query.filter) {
            baseQuery = {
                returnDate: { $eq: null },
                dateOut: { $gt: format('yyyy-MM-dd', new Date(new Date().setFullYear(new Date().getFullYear() - 2))) }
            };
        }
        
        const transformRow = (repair) => {
            var customerName = "";
            if (repair.customerFirstName) customerName += repair.customerFirstName;
            if (repair.customerFirstName && repair.customerLastName) customerName += " ";
            if (repair.customerLastName) customerName += repair.customerLastName;

            var formattedRepairCost = "";
            if (repair.repairCost != null) {
                formattedRepairCost = formatCurrency(repair.repairCost, opts);
            }

            return [
                '<a href="/app/repairs/' + repair._id + '">' + repair.repairNumber + '</a>',
                repair.itemNumber,
                repair.description,
                '<div style="white-space: nowrap;">' + formatDateTime(repair.dateOut) + '</div>',
                '<div style="white-space: nowrap;">' + formatDateTime(repair.customerApprovedDate) + '</div>',
                '<div style="white-space: nowrap;">' + formatDateTime(repair.returnDate) + '</div>',
                customerName,
                repair.vendor,
                formattedRepairCost
            ];
        };
        
        const queryPromise = handleDataTablesQueryWithEstimatedCount(Repair, params, {
            baseQuery,
            searchField: 'search',
            sortClause: { dateOut: -1 },
            selectFields: {
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
            },
            transformRow
        });
        
        sendDataTablesResponse(res, queryPromise);
    });

router.route('/repairs/:repair_id/print')
    .get(checkJwt, function (req, res) {


        var opts = { format: '%s%v', symbol: '$' };

        Repair.findById(req.params.repair_id, function (err, repair) {
            if (err) {
                res.send(err);
            }
            else {
                fs.readFile('./app/modules/repair/repair-content.html', 'utf-8', function (err, template) {
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
    .get(checkJwt, function (req, res) {
        Repair.findById(req.params.repair_id, function (err, ret) {
            if (err)
                res.send(err);
            res.json(ret);
        });
    });

router.route('/repairs/products/:item_id')
    .get(checkJwt, function (req, res) {

        Repair.find({ itemId: req.params.item_id }, function (err, ret) {
            if (err)
                res.send(err);
            res.json(ret);
        });
    });

router.route('/repairs/:repair_id/return')
    .put(checkJwt, function (req, res) {
        Repair.findById(req.params.repair_id, function (err, repair) {
            if (err)
                res.send(err);

            if (repair.returnDate == null) {
                repair.returnDate = new Date();
                repair.save(function (err) {
                    if (err)
                        res.send(err);

                    history.updateProductHistory([{ productId: repair.itemId }], "In Stock", "back from repair", req.user['http://mynamespace/name'], null);

                    res.json({
                        message: 'Repair updated!'
                    });
                });
            } else {
                res.json({
                    message: 'Repair was already returned'
                });
            }
        });
    });

router.route('/repairs/email')
    .post(checkJwt, function (req, res) {

        const to = parseEmailAddresses(req.body.emailAddresses);
        const subject = `${config.tenant.name} Repair`;
        const templatePath = './app/modules/repair/repair-content.html';
        const note = req.body.note;

        Repair.findById(req.body.repairId, async function (err, repair) {
            if (err) {
                res.send(err);
                return;
            }

            try {
                await sendTemplatedEmail(to, subject, templatePath, repair, note);
                res.json("ok");
            } catch (error) {
                console.error('Error sending repair email:', error);
                res.status(500).send('Error sending email');
            }
        });
    });

module.exports = router;
