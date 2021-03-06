var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Product = require('../models/product');
var Repair = require('../models/repair');
var Invoice = require('../models/invoice');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');
const formatCurrency = require('format-currency');

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

    var search = req.body.itemNumber + " " + formatDate(new Date()) + " " + req.body.history.receivedFrom + " " + req.body.history.customerName
        + " " + req.body.history.repairNumber + " " + req.body.history.itemReceived + req.body.history.user + " " + req.body.history.comments;

    var action = req.body.history.action || "received";

    if (req.body.history.repairNumber != null){
        console.log('looking for repairNumber ' + req.body.history.repairNumber);
        console.log('repair cost is ' + req.body.history.repairCost ||0 );


        var returnDate = null;

        if(req.body.history.date==null){
            console.log("history date is null, setting now");
            returnDate = new Date();
        }
        else {
            console.log("history date is not null");
            returnDate = new Date(req.body.history.date);
        }

        console.log("return date for repairs is " + returnDate);

        var fromTime = new Date(returnDate);
        var toTime = new Date(returnDate);

        fromTime.setSeconds(fromTime.getSeconds()-10);
        toTime.setSeconds(toTime.getSeconds()+10);

        Repair.update({
            repairNumber: req.body.history.repairNumber,

            $or: [
                {"returnDate": null},
                {"returnDate": {"$gte": fromTime, "$lt": toTime}}
            ]
        }, {
            "$set": {
                "returnDate": returnDate,
                "repairCost": req.body.history.repairCost || 0,
                "repairNotes": req.body.history.comments
            }
        }, {
            upsert: false, multi: false
        }, function (err, doc) {
            if (err)
                console.log('repair could not be marked as returned ' + err);
            else
            console.log('repair returned')
        });



    }else{
        console.log('not looking for repair');
    }


    if(req.body.history._id !=null){

        console.log("updating existing history item " +req.body.history._id );

        // ---------------------------------
        // update existing history item
        // ---------------------------------
        Product.findOneAndUpdate({
            'history._id': req.body.history._id
        }, {

            "$set": {
                // don't change date...   'history.$.date': Date.now(),
                    'history.$.action': action,
                    'history.$.user': req.body.history.user,
                    'history.$.itemReceived': req.body.history.itemReceived,
                    'history.$.receivedFrom': req.body.history.receivedFrom,
                    'history.$.repairNumber': req.body.history.repairNumber,
                    'history.$.customerName': req.body.history.customerName,
                    'history.$.comments': req.body.history.comments,
                    'history.$.search': search,
                    'history.$.repairCost':  req.body.history.repairCost || 0,
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

        Product.findById(productId,'status', function(err,product){

            Invoice.findOne({'lineItems.productId':productId, 'invoiceType': "Invoice"
                },function (err, doc){
                    if (err){
                        console.log("error looking for invoice that contains item : " + productId + ", " + err);
                    }else{

                        // figure out new state for received item


                        var newStatus = product.status;

                        if(product.status == "Sold"){
                            newStatus = "In Stock";
                        }
                        else if (product.status == "Memo"){
                            newStatus = "In Stock";
                        }

                        else if (product.status == "Repair"){
                            if(doc==null){
                                console.log("found NO invoices that contains item : " + productId);
                                newStatus = "In Stock"
                            }else {
                                console.log("found at least one invoice that contains item : " + productId);
                                newStatus = "Sold"
                            }
                        }

                        console.log("checking existing product in, status was " + product.status + ", setting status to " + newStatus);
                        var updates = {
                            "lastUpdated": Date.now(),
                            "status": newStatus
                        };

                        //TODO: update total repair cost maybe?... will now calculate on display only.

                        // ---------------------------------
                        // create new history item and product status
                        // ---------------------------------
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
                                    repairCost:  req.body.history.repairCost || 0,
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

                    }
            });

        });

    } else {  // create new product


        // ---------------------------------
        // create new product
        // ---------------------------------
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

                    // update info inside any invoices

                    
                        Invoice.update({'lineItems.productId':req.body._id},
                            {$set: {
                                'lineItems.$.itemNumber': req.body.itemNumber,
                                'lineItems.$.name': req.body.title,
                                'lineItems.$.longDesc': longDesc,
                                'lineItems.$.serialNumber': req.body.serialNo
                            }
                        },{multi: true}, function (err, doc){
                        if (err){
                            console.log("ERROR: " + err);
                        }

                        console.log("updated subdocs for product in invoice " + JSON.stringify(doc));

                            return res.send("product updated");
                        });



                });





        }
    })

    // no checkJwt for inventory list... makes logout more reliable and inventory list is "public" anyway
    .get( function(req, res) {

        var itemNumber = req.query.itemNumber;

        if (itemNumber != null) {
            Product.findOne({'itemNumber': itemNumber}, '_id title status', function (err, product) {
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
            sortClause = {sellingPrice: sortOrder};
        else if ("4" == sortColumn)
            sortClause = {modelNumber: sortOrder};
        else if ("5" == sortColumn)
            sortClause = {status: sortOrder};

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



                var titleAndDial = products[i].title;
                if(products[i].dial!=null && products[i].dial !=""){
                    titleAndDial += ' - ' + products[i].dial;
                }

                results.data.push(
                    [
                        '<a href=\"#\" onclick=\"selectProduct(\'' + products[i]._id + '\');return false;\">' + products[i].itemNumber + '</a>',
                        titleAndDial,
                        products[i].serialNo,
                        formatCurrency(products[i].sellingPrice,opts),
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
                            { status: {$ne: "Deleted"}},
                            { itemNumber: {$ne: null}},
                            { itemNumber: {$ne: ""}},
                            {'search': new RegExp(search, 'i')}
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
            upsert: true
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


    router.route('/products/:itemNumber/undelete')
    .put(checkJwt, function (req, res) {

        console.log('setting status to In Stock (undeleting) item ' + req.params.itemNumber);

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
            upsert: true
        }, function (err, doc) {

            console.log('_id is '+ doc._id);
            if (err){
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
                    console.log('did not find existing product with itemNumber ' + req.body.itemNumber);
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
        aggregate([


            {$unwind: "$history"},
            { $match: {$and: [
            {'history.action': 'received'},
            {'history.search': new RegExp(search, 'i')}
                ]}   }]).
        sort(sortClause).skip(parseInt(start)).limit(parseInt(length))
            .exec(function (err, products) {

            if(products==null){
                console.log("no log items found");
            }

            else {

                for (var i = 0; i < products.length; i++) {

                        var itemReceived = "";
                        if (products[i].itemNumber != null && products[i].itemNumber != "") {
                            itemReceived += products[i].itemNumber + ": ";
                        }
                        itemReceived += products[i].history.itemReceived;

                        results.data.push(
                            [
                                '<a href=\"#\" onclick=\"selectProduct(\'' + products[i].history._id + '\');return false;\"><div style="white-space: nowrap;">' + format('yyyy-MM-dd hh:mm', products[i].history.date) + '</div></a>',
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




                Product.aggregate([{$unwind: "$history"},
                    {
                    $match: {
                        $and: [
                            {'history.action': 'received'}

                        ]
                    },
                },
            
                {$group:
                {
                  _id:  null
                  ,count: { $sum: 1 }
                }}
            
            
            ]).exec(function (err, products2) {
                    if(products2==null || products2[0]==null){
                        console.log('warning, showing zero total log entries!');
                        results.recordsTotal = 0;
                    }else{
                    results.recordsTotal = products2[0].count;
                    }


                    if (search == '' || search == null) {
                        results.recordsFiltered = results.recordsTotal;
                        res.json(results);
                    }else {


                        Product.aggregate([
                            {$unwind: "$history"},{
                            $match: {
                                $and: [
                                    {'history.action': 'received'},
                                    {'history.search': new RegExp(search, 'i')}
                                ]
                            }
                        },
            
                        {$group:
                        {
                          _id:  null
                          ,count: { $sum: 1 }
                        }}]).exec(function (err, products3) {
                            if(products3==null||products3[0]==null){
                                console.log('warning, showing zero filtered log entries!');
                                results.recordsFiltered = 0;
                            }else{
                                results.recordsFiltered = products3[0].count
                            }

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
