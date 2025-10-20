var express = require('express');
var router = express.Router();
var Product = require('../models/product');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');
const formatCurrency = require('format-currency');
const { formatDate } = require('./utils/date-utils');

// formatDate function moved to ./utils/date-utils.js

router.use(function (req, res, next) {
    next();
});

router.route('/products/outtoshow')
    .post(checkJwt, function (req, res) {
        var itemNumbers = req.body;
        var enteredCount = 0;
        var query;
        var ors = { $or: [] };

        for (var i = 0; i < itemNumbers.length; i++) {
            if (itemNumbers[i] != null && itemNumbers[i].length > 0) {
                enteredCount++;
                ors.$or.push({ 'itemNumber': itemNumbers[i] })
            }
        }

        if (enteredCount > 0) {
            query = { $and: [{ 'status': "In Stock" }, ors] };
            Product.update(query, {
                "$push": {
                    "history": {
                        user: req.user['http://mynamespace/name'],
                        date: Date.now(),
                        action: "sent to show"
                    }
                },
                "$set": { "lastUpdated": Date.now(), "status": "At Show" }
            }, { multi: true },
                function (err, obj) {
                    if (err) {
                        console.error('Error updating products to At Show:', err);
                        return res.send("unable to set anything to At Show: " + err);
                    } else {
                        var nModified = obj.nModified;
                        return res.send("Entered a total of " + enteredCount + " products.  Updated total of " + nModified + " from \"In Stock\" to \"At Show\"");
                    }
                });
        }
    }
    );

router.route('/products/backfromshow')
    .post(checkJwt, function (req, res) {
        Product.update({ 'status': "At Show" },
            {
                "$push": {
                    "history": {
                        user: req.user['http://mynamespace/name'],
                        date: Date.now(),
                        action: "returned from show"
                    }
                },
                "$set": { "lastUpdated": Date.now(), "status": "In Stock" }
            }, { multi: true },
            function (err, obj) {
                if (err) {
                    console.error('Error updating products back from show:', err);
                    return res.send("unable to set anything to At Show: " + err);
                } else {
                    var nModified = obj.nModified;
                    return res.send("Updated total of " + nModified + " from \"At Show\" to \"In Stock\"");
                }
            });
    }
    );

router.route('/products')
    .post(checkJwt, function (req, res) {

        // validate
        if (!req.body.itemNumber) {
            return res.send(400, { error: "item number is required" });
        }

        var longDesc = req.body.longDesc;
        if (!longDesc) longDesc = req.body.title;

        var product = {
            "itemNumber": req.body.itemNumber,
            "title": req.body.title,
            "productType": req.body.productType,
            "manufacturer": req.body.manufacturer,
            "paymentMethod": req.body.paymentMethod,
            "paymentDetails": req.body.paymentDetails,
            "model": req.body.model,
            "modelNumber": req.body.modelNumber,
            "condition": req.body.condition,
            "gender": req.body.gender,
            "features": req.body.features,
            "case": req.body.case,
            "size": req.body.size,
            "dial": req.body.dial,
            "bracelet": req.body.bracelet,
            "comments": req.body.comments,
            "serialNo": req.body.serialNo,
            "longDesc": longDesc,
            "supplier": req.body.supplier,
            "cost": req.body.cost || 0,
            "sellingPrice": req.body.sellingPrice || 0,
            "listPrice": req.body.listPrice || 0,
            "totalRepairCost": req.body.totalRepairCost || 0,
            "notes": req.body.notes,
            "ebayNoReserve": req.body.ebayNoReserve,
            "inventoryItem": req.body.inventoryItem,
            "seller": req.body.seller,
            "sellerType": req.body.sellerType,
            "lastUpdated": Date.now(),
            // dont allow update of status, must be driven by action
            //"status": req.body.status,
            "search": req.body.itemNumber + " " + req.body.title + " " + req.body.serialNo + " " + req.body.modelNumber
        }

        // is existing item?
        if (req.body._id == null) {

            Product.findOne({ 'itemNumber': req.body.itemNumber }, '_id lastUpdated', function (err, dupeProduct) {
                if (err) return res.send(500, { error: err });

                else if (dupeProduct != null) {
                    return res.send(409, { error: 'error: item number ' + req.body.itemNumber + ' already exists' });

                } else {

                    product.history = {
                        user: req.user['http://mynamespace/name'],
                        date: Date.now(),
                        action: "entered",
                        search: formatDate(new Date()) + " " + req.user['http://mynamespace/name']
                    };

                    product.status = 'In Stock';

                    Product.create(product, function (err, createdProduct) {
                        if (err) {
                            console.error('Error saving product:', err);
                            return res.send(err);
                        } else {
                            return res.json({
                                message: 'product created'
                            });
                        }
                    });
                }
            });

        } else {

            Product.findByIdAndUpdate(
                req.body._id,
                product, {
                upsert: true, useFindAndModify: false
            }, function (err, doc) {
                if (err) {
                    return res.send(500, {
                        error: err
                    });
                } else {
                    return res.json({
                        message: 'product created'
                    });
                }
            });
        }
    })

    // no checkJwt for inventory list... makes logout more reliable and inventory list is "public" anyway
    .get(function (req, res) {

        var itemNumber = req.query.itemNumber;

        if (itemNumber != null) {
            Product.findOne({ 'itemNumber': itemNumber }, '_id title status', function (err, product) {
                res.json(product);
            });
            return;
        }

        var status = req.query.status;

        var draw = req.query.draw;
        var start = 0;
        var length = 10;

        if (req.query.start) start = req.query.start;
        if (req.query.length) length = req.query.length;

        var search = req.query.search.value;
        var results = {
            "draw": draw,
            "recordsTotal": 0,
            "recordsFiltered": 0,
            "data": []
        };

        var statusFilter;
        if (status == "Available") {
            // value of "Available" maps to "In Stock" and "Partnership"
            statusFilter = { $in: ["In Stock", "Partnership"] }

        } else if (status == "Out") {
            // value of "Out" maps to "Sold" and "Memo"
            statusFilter = { $in: ["Sold", "Memo", "Incoming"] }

        } else {
            statusFilter = {
                $ne: "Deleted"
            };
        }

        var sortOrder = -1;

        if (req.query.order != null) {
            var sortColumn = req.query.order[0]['column'];


            if ("asc" == req.query.order[0]['dir'])
                sortOrder = 1;
        }

        var sortClause = { lastUpdated: sortOrder };
        if ("0" == sortColumn)
            sortClause = { itemNumber: sortOrder };
        else if ("1" == sortColumn)
            sortClause = { title: sortOrder };
        else if ("2" == sortColumn)
            sortClause = { serialNo: sortOrder };
        else if ("3" == sortColumn)
            sortClause = { sellingPrice: sortOrder };
        else if ("4" == sortColumn)
            sortClause = { modelNumber: sortOrder };
        else if ("5" == sortColumn)
            sortClause = { status: sortOrder };

        Product.find({
            $and: [
                { status: statusFilter },
                { itemNumber: { $ne: null } },
                { itemNumber: { $ne: "" } },
                { title: { $ne: null } },
                { 'search': new RegExp(search, 'i') }
            ]
        }, function (err, products) {

            if (err)
                res.send(err);

            var opts = { format: '%s%v', symbol: '$' };


            for (var i = 0; i < products.length; i++) {

                var status = products[i].statusDisplay;

                var badgeStyle = "default"; // grey
                if (status == 'In Stock' || status == 'Partnership' || status == 'Consignment' || status == 'Problem')
                    badgeStyle = "success"; // green
                else if (status == 'Repair' || status == 'Memo' || status == 'At Show')
                    badgeStyle = "warning" // yellow
                else if (status == 'Sale Pending')
                    badgeStyle = "danger" // red
                else if (status == 'Incoming')
                    badgeStyle = "info" // aqua

                var titleAndDial = products[i].title;
                if (products[i].dial != null && products[i].dial != "") {
                    titleAndDial += ' - ' + products[i].dial;
                }

                results.data.push(
                    [
                        '<a href=\"/app/products/' + products[i]._id + '\">' + products[i].itemNumber + '</a>',
                        titleAndDial,
                        products[i].serialNo,
                        formatCurrency(products[i].sellingPrice, opts),
                        products[i].modelNumber,
                        "<span class=\"badge bg-" + badgeStyle + "\">" + status + "</span>",
                        format('yyyy-MM-dd', products[i].lastUpdated),
                    ]
                );
            }

            Product.countDocuments({
                $and: [
                    { status: statusFilter },
                    { itemNumber: { $ne: null } },
                    { itemNumber: { $ne: "" } },
                    { title: { $ne: null } }
                ]

            }, function (err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Product.countDocuments({

                        $and: [
                            { status: { $ne: "Deleted" } },
                            { itemNumber: { $ne: null } },
                            { itemNumber: { $ne: "" } },
                            { 'search': new RegExp(search, 'i') }
                        ]

                    }, function (err, count) {
                        results.recordsFiltered = count;
                        res.json(results);
                    });
                }
            });

        }).sort(sortClause).skip(parseInt(start)).limit(parseInt(length)).select({
            itemNumber: 1,
            title: 1,
            dial: 1,
            sellingPrice: 1,
            serialNo: 1,
            modelNumber: 1,
            status: 1,
            productType: 1,
            lastUpdated: 1,
            sellerType: 1
        });
    });

router.route('/products/:product_id')
    .get(checkJwt, function (req, res) {

        if (req.params.product_id) {
            Product.findById(req.params.product_id, function (err, product) {
                if (err) {
                    res.send(err);
                } else {
                    res.json(product);
                }
            });
        }
    })

    .delete(checkJwt, function (req, res) {
        Product.findOneAndUpdate({
            _id: req.params.product_id
        }, {

            "$push": {
                "history": {
                    user: req.user['http://mynamespace/name'],
                    date: Date.now(),
                    action: "item deleted"
                }
            },
            "$set": {
                "lastUpdated": Date.now(),
                "status": "Deleted"
            }
        }, {
            upsert: true, useFindAndModify: false
        }, function (err, doc) {
            if (err)
                res.send(err);
            res.json({
                message: 'item deleted!'
            });
        });
    });

router.route('/products/:product_id/status')
    .put(checkJwt, function (req, res) {

        var newStatus = req.body.status;
        var responseData = {
            "status": newStatus
        }

        Product.findOneAndUpdate({
            _id: req.params.product_id
        }, {

            "$push": {
                "history": {
                    user: req.user['http://mynamespace/name'],
                    date: Date.now(),
                    action: "item " + newStatus.toLowerCase()
                }
            },
            "$set": {
                "lastUpdated": Date.now(),
                "status": req.body.status
            }
        }, {
            upsert: true, useFindAndModify: false
        }, function (err, doc) {
            if (err)
                res.send(err);
            res.json(responseData);
        });
    });

router.route('/products/:itemNumber/undelete')
    .put(checkJwt, function (req, res) {

        Product.findOneAndUpdate({
            itemNumber: req.params.itemNumber
        }, {
            "$push": {
                "history": {
                    user: req.user['http://mynamespace/name'],
                    date: Date.now(),
                    action: "item undeleted"
                }
            },
            "$set": {
                "lastUpdated": Date.now(),
                "status": "In Stock"
            }
        }, {
            upsert: true, useFindAndModify: false
        }, function (err, doc) {

            if (err) {
                res.send(err);
            }

            var responseData = {
                "_id": doc._id
            }

            res.json(responseData);
        });
    });

router.route('/products/:product_id/notes')
    .post(checkJwt, function (req, res) {

        Product.findOneAndUpdate({
            _id: req.params.product_id
        }, {

            "$push": {
                "history": {
                    user: req.user['http://mynamespace/name'],
                    date: Date.now(),
                    action: req.body.noteText
                }
            },
            "$set": {
                "lastUpdated": Date.now()
            }
        }, {
            upsert: true, useFindAndModify: false
        }, function (err, doc) {
            if (err)
                res.send(err);
            else
                res.send('note successfully added');
        });

    })
    .get(checkJwt, function (req, res) {

        Product.findById(req.params.product_id, function (err, product) {
            if (err) {
                res.send(err);
            } else {
                res.json(product.history);
            }
        });
    });


module.exports = router;
