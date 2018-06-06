var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Product = require('../models/product');
var Repair = require('../models/repair');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

function formatDate(date) {
    console.log('formatting date, yo: ' + date);
    if (date == null) return "";
    else {
        return format('yyyy-MM-dd', date);
    }
}

router.use(function (req, res, next) {
    next();
});

var upsertLogItem = function (req, res, productId, action) {

    var search = formatDate(new Date()) + " " + req.body.history.receivedFrom + " " + req.body.history.customerName
        + " " + req.body.history.repairNumber + " " + req.body.history.itemReceived + req.body.history.user + " " + req.body.history.comments;

    var action = req.body.history.action || "received";



    if (req.body.history.repairNumber != null){
        console.log('looking for repairNumber ' + req.body.history.repairNumber);
        console.log('repair cost is ' + req.body.totalRepairCost );
        Repair.update({
            repairNumber: req.body.history.repairNumber,
            returnDate: null
        }, {
            "$set": {
                "returnDate": Date.now(),
                "repairCost": req.body.totalRepairCost || 0,
                "repairNotes": req.body.history.comments
            }
        }, {
            upsert: true, multi: true
        }, function (err, doc) {
            if (err)
                console.log('repair could not be marked as returned ' + err);
            else
                console.log('repair returned')
        });
    }else{
        console.log('not looking for repair');
    }

    // update existing history item
    if(req.body.history._id !=null){

        console.log("updating existing history itemn " +req.body.history._id );

        Product.findOneAndUpdate({
            'history._id': req.body.history._id
        }, {

            "$set": {
                'history.$.date': Date.now(),
                    'history.$.action': action,
                    'history.$.user': req.body.history.user,
                    'history.$.itemReceived': req.body.history.itemReceived,
                    'history.$.receivedFrom': req.body.history.receivedFrom,
                    'history.$.repairNumber': req.body.history.repairNumber,
                    'history.$.customerName': req.body.history.customerName,
                    'history.$.comments': req.body.history.comments,
                    'history.$.search': search,
                    totalRepairCost: req.body.repairCost || 0,
                    itemNumber: req.body.itemNumber
            }
        }, {
            upsert: true
        }, function (err, doc) {
            if (err) return res.send(500, {
                error: err
            });
            return res.send("successfully saved");
        });
    }


    else if (productId != null) { // update existing product

        // determine if product was sellerType Partner

        var newStatus = "In Stock";

        Product.findById(productId,'sellerType', function(err,product){


            console.log("found product... sellerType is " + product.sellerType);
            if("Partner"==product.sellerType){
                newStatus = "Partnership"
            }

            console.log("checking existing product in, setting status to " + newStatus);
            var updates = {
                "lastUpdated": Date.now(),
                "status": newStatus
            };

            if(req.body.history.repairNumber!=null){
                updates.totalRepairCost = req.body.totalRepairCost;
            }




            Product.findOneAndUpdate({
                _id: productId
            }, {

                "$push": {
                    "history": {
                        user: req.body.history.user,
                        date: Date.now(),
                        action: "received",
                        itemReceived: req.body.history.itemReceived,
                        receivedFrom: req.body.history.receivedFrom,
                        repairNumber: req.body.history.repairNumber,
                        customerName: req.body.history.customerName,
                        comments: req.body.history.comments,
                        search: search
                    }
                },
                "$set": updates
            }, {
                upsert: true
            }, function (err, doc) {
                if (err) return res.send(500, {
                    error: err
                });
                return res.send("successfully saved");
            });
        });

    } else {  // create new product

        var product = new Product();
        product.itemNumber = req.body.itemNumber;
        product.title = req.body.history.itemReceived;
        product.longDesc = req.body.history.itemReceived;
        product.search = req.body.itemNumber + " " + req.body.history.itemReceived;
        product.lastUpdated = Date.now();
        product.status = "In Stock";
        product.history = {
            user: req.body.history.user,
            date: Date.now(),
            action: "received",
            itemReceived: req.body.history.itemReceived,
            receivedFrom: req.body.history.receivedFrom,
            repairNumber: req.body.history.repairNumber,
            customerName: req.body.history.customerName,
            comments: req.body.history.comments,
            search: search
        }
        product.totalRepairCost = req.body.repairCost;

        product.save(function (err) {
            if (err) {
                console.log('error saving product: ' + err);
                return res.send(err);
            } else {
                return res.json({
                    message: 'product saved'
                });
            }
        });
    }
}


router.route('/products/outtoshow')
    .post(checkJwt, function (req, res) {
            var itemNumbers = req.body;
            var enteredCount = 0;
            var query;
            var ors = {$or: []};

            for (var i = 0; i < itemNumbers.length; i++) {
                if (itemNumbers[i] != null && itemNumbers[i].length > 0) {
                    enteredCount++;
                    ors.$or.push({'itemNumber': itemNumbers[i]})
                }
            }

            if (enteredCount > 0) {
                query = {$and: [{'status': "In Stock"}, ors]};
                console.log("query is " + JSON.stringify(query));
                Product.update(query, {
                        "$push": {
                            "history": {
                                user: req.user['http://mynamespace/name'],
                                date: Date.now(),
                                action: "sent to show"
                            }
                        },
                        "$set": {"lastUpdated": Date.now(), "status": "At Show"}
                    }, {multi: true},
                    function (err, obj) {
                        if (err) {
                            console.log('error: ' + err);
                            return res.send("unable to set anything to At Show: " + err);
                        } else {
                            console.log("done: " + JSON.stringify(obj));

                            var nModified = obj.nModified;

                            console.log("data is " + JSON.stringify(req.body));
                            return res.send("Entered a total of " + enteredCount + " products.  Updated total of " + nModified + " from \"In Stock\" to \"At Show\"");
                        }
                    });
            }
        }
    );


router.route('/products/backfromshow')
    .post(checkJwt, function (req, res) {
            Product.update({'status': "At Show"},
                {
                    "$push": {
                        "history": {
                            user: req.user['http://mynamespace/name'],
                            date: Date.now(),
                            action: "returned from show"
                        }
                        },
                    "$set": {"lastUpdated": Date.now(), "status": "In Stock"}
                    }, {multi: true},
                function (err, obj) {
                    if (err) {
                        console.log('error: ' + err);
                        return res.send("unable to set anything to At Show: " + err);
                    } else {
                        console.log("done: " + JSON.stringify(obj));
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
            return res.send(400, {error: "item number is required"});
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
            "status": req.body.status,
            "search": req.body.itemNumber + " " + req.body.title + " " + req.body.serialNo + " " + req.body.modelNumber
        }

        // is existing item?
        if (req.body._id == null) {

            console.log('item  specified, looking for existing item');

            Product.findOne({'itemNumber': req.body.itemNumber}, '_id lastUpdated', function (err, dupeProduct) {
                if (err) return res.send(500, {error: err});

                else if (dupeProduct != null) {
                    console.log('found existing product with itemNumber ' + req.body.itemNumber);

                    return res.send(409, {error: 'error: item number ' + req.body.itemNumber + ' already exists'});

                } else {
                    console.log('didnt find existing product with itemNumber ' + req.body.itemNumber);

                    console.log('creating new product');

                    product.history = {
                        user: req.user['http://mynamespace/name'],
                        date: Date.now(),
                        action: "entered",
                        search: formatDate(new Date()) + " " + req.user['http://mynamespace/name']
                    };

                    Product.create(product, function (err,createdProduct) {
                        if (err) {
                            console.log('error saving product: ' + err);
                            return res.send(err);
                        } else {

                            console.log("created product, id = " + createdProduct._id + " item number is " + createdProduct.itemNumber);
                            return res.json({
                                message: 'product created'
                            });
                        }
                    });
                }
            });

        } else {


            console.log('updating existing product');

            Product.findByIdAndUpdate(
                req.body._id,
                product, {
                    upsert: true
                }, function (err, doc) {
                    if (err) return res.send(500, {
                        error: err
                    });
                    return res.send("product updated");
                });
        }
    })

    //.get(checkJwt, function(req, res) {
    .get(function (req, res) {


        var itemNumber = req.query.itemNumber;

        if (itemNumber != null) {
            Product.findOne({'itemNumber': itemNumber}, '_id title', function (err, product) {
                res.json(product);
            });
            return;
        }

        var query = "";
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
        if (status != null) {
            // value of "Available" maps to "In Stock" and "Partnership"
            statusFilter = { $in: ["In Stock","Partnership"] }

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

        var sortClause = {lastUpdated: sortOrder};
        if ("0" == sortColumn)
            sortClause = {itemNumber: sortOrder};
        else if ("1" == sortColumn)
            sortClause = {title: sortOrder};
        else if ("2" == sortColumn)
            sortClause = {serialNo: sortOrder};
        else if ("3" == sortColumn)
            sortClause = {modelNumber: sortOrder};
        else if ("4" == sortColumn)
            sortClause = {status: sortOrder};

        Product.find({
            $and: [{
                status: statusFilter
            },
                {
                    itemNumber: {$ne: null}
                }

                , {
                    'search': new RegExp(search, 'i')
                }]
        }, function (err, products) {

            if (err)
                res.send(err);

            for (var i = 0; i < products.length; i++) {

                var badgeStyle = "default"; // grey
                if (products[i].status == 'In Stock' || products[i].status == 'Partnership' || products[i].status == 'Problem')
                    badgeStyle = "success"; // green
                else if (products[i].status == 'Repair' || products[i].status == 'Memo' || products[i].status == 'At Show')
                    badgeStyle = "warning" // yellow
                else if (products[i].status == 'Sale Pending')
                    badgeStyle = "danger" // red

                results.data.push(
                    [
                        '<a href=\"#\" onclick=\"selectProduct(\'' + products[i]._id + '\');return false;\">' + products[i].itemNumber + '</a>',
                        //'<a href=\"/#/app/item/' + products[i]._id + '\">' + products[i]._id,
                        products[i].title,
                        products[i].serialNo,
                        products[i].modelNumber,
                        "<span class=\"badge bg-" + badgeStyle + "\">" + products[i].status + "</span>",
                        format('yyyy-MM-dd', products[i].lastUpdated),
                    ]
                );
            }

            Product.count({
                status: statusFilter
            }, function (err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Product.count({

                        $and: [{
                            status: {
                                $ne: "Deleted"
                            }
                        }, {
                            'search': new RegExp(search, 'i')
                        }]

                    }, function (err, count) {
                        results.recordsFiltered = count;
                        res.json(results);
                    });
                }
            });

        }).sort(sortClause).skip(parseInt(start)).limit(parseInt(length)).select({
            itemNumber: 1,
            title: 1,
            serialNo: 1,
            modelNumber: 1,
            status: 1,
            productType: 1,
            lastUpdated: 1
        });
    });


router.route('/products/:product_id')
    .get(checkJwt, function (req, res) {

        if (req.params.product_id) {
            Product.findById(req.params.product_id, function (err, product) {
                if (err) {
                    res.send(err);
                }else {
                    res.json(product);
                }
            });
        }
    })

    // TODO: is this block dead code?
    .put(checkJwt, function (req, res) {
        Product.findById(req.params.product_id, function (err, product) {
            if (err)
                res.send(err);
            product.itemNumber = req.body.itemNumber;
            product.serialNo = req.body.serialNo;
            product.title = req.body.title;
            product.sellingPrice = req.body.sellingPrice;
            product.save(function (err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'Product updated!'
                });
            });
        });
    })

    .delete(checkJwt, function (req, res) {

        Product.findById(req.params.product_id, function (err, product) {
            if (err)
                res.send(err);
            product.status = 'Deleted';
            product.save(function (err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'Product updated!'
                });
            });
        });
    });


router.route('/products/:product_id/status')
    .put(checkJwt, function (req, res) {

        var newStatus = req.body.status;

        console.log('setting status to ' + newStatus);

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
            upsert: true
        }, function (err, doc) {
            if (err)
                res.send(err);
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
            upsert: true
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


router.route('/logitems')

    .post(checkJwt, function (req, res) {


        if (req.body.itemNumber == null || req.body.itemNumber == "") {
            console.log('no item number, creating new log item');
            return upsertLogItem(req, res, null);
        }

        else {
            console.log('item  specified, looking for existing item');

            Product.findOne({'itemNumber': req.body.itemNumber}, '_id lastUpdated', function (err, product) {
                if (err) return res.send(500, {
                    error: err
                });

                else if (product != null) {
                    console.log('found existing product with itemNumber ' + req.body.itemNumber);
                    console.log("creating new log item for existing item");
                    return upsertLogItem(req, res, product._id,);
                } else {
                    console.log('didnt find existing product with itemNumber ' + req.body.itemNumber);
                    return upsertLogItem(req, res, null);
                }
            });
        }
    })

    .get(function (req, res) {

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

        var sortClause = {"history.date": -1};

        Product.
        aggregate([{ $match: {$and: [
            {'history.action': 'received'},
            {'history.search': new RegExp(search, 'i')}
                ]}   }]).
        unwind('history').sort(sortClause).skip(parseInt(start)).limit(parseInt(length))
            .exec(function (err, products) {

            if(products==null){
                console.log("no log items found");
            }

            else {

                for (var i = 0; i < products.length; i++) {

                    if (products[i].history.action == "received") {


                        var itemReceived = "";
                        if (products[i].itemNumber != null && products[i].itemNumber != "") {
                            itemReceived += products[i].itemNumber + ": ";
                        }
                        itemReceived += products[i].history.itemReceived;

                        results.data.push(
                            [
                                '<a href=\"#\" onclick=\"selectProduct(\'' + products[i].history._id + '\');return false;\"><div style="white-space: nowrap;">' + format('yyyy-MM-dd', products[i].history.date) + '</div></a>',
                                products[i].history.receivedFrom,
                                products[i].history.customerName,
                                itemReceived,
                                products[i].history.repairNumber,
                                products[i].history.user,
                                products[i].history.comments
                            ]
                        );
                    }
                }
            }

            Product.count({
                'history.action': 'received'
            }, function (err, count) {
                results.recordsTotal = count;

                if (search == '' || search == null) {
                    results.recordsFiltered = count;
                    res.json(results);
                } else {
                    Product.count({
                        'history.action': 'received'
                    }, function (err, count) {
                        results.recordsFiltered = count;
                        res.json(results);
                    });
                }
            });
        });
    });


router.route('/logitems/:id')
    .get(function (req, res) {

        Product.aggregate([

            {
                $match: {
                    'history._id': mongoose.Types.ObjectId(req.params.id)
                }
            }
        ]).unwind('history').limit(50)
            .exec(function (err, products) {

                var logitem = {};

                // above will return unwound docs, one for each history item, find correct one
                for (var i = 0; i < products.length; i++) {
                    if (products[i].history._id == req.params.id) {
                        logitem = products[i];
                    }
                }

                res.json(logitem);
            });
    });



module.exports = router;
