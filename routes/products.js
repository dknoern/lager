var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Product = require('../models/product');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

// works better, date=format gives error in some cases when using new Date() or Date.now()
var dateFormat = require('dateformat');

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

var upsertProduct = function (req, res, productId, action) {
    var paymentAmount = req.body.paymentAmount || 0;
    var totalRepairCost = req.body.totalRepairCost || 0;
    var cost = paymentAmount + totalRepairCost;


    var history;

    if(req.body.history!=null && req.body.history.itemReceived!=null){
        var search = formatDate(Date.now()) + " " + req.body.history.receivedFrom + " " + req.body.history.customerName
            + " " + req.body.history.itemReceived + req.body.history.receivedBy +  " " + req.body.history.comments;

        history = {
            user: req.body.history.receivedBy,
            date: Date.now(),
            action: "received",
            itemReceived: req.body.history.itemReceived,
            receivedFrom: req.body.history.receivedFrom,
            customerName: req.body.history.customerName,
            comments: req.body.history.comments,
            search: search
        };

    }else {

        var search = formatDate(Date.now) + " " + req.user['http://mynamespace/name'];

        history = {
            user: req.user['http://mynamespace/name'],
            date: Date.now(),
            action: action,
            search: search
        }
    }

    if (productId != null) { // update existing product


        var historySearchTerm = "";
        if(history!=null && history.customerName !=null){
            historySearchTerm = " " + history.customerName;
        }

        Product.findOneAndUpdate({
            _id: productId
        }, {

            "$push": {
                "history": history
            },
            "$set": {
                "_id": productId,
                "itemNumber": req.body.itemNumber,
                "title": req.body.title,
                "productType": req.body.productType,
                "manufacturer": req.body.manufacturer,
                "paymentAmount": paymentAmount,
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
                "longDesc": req.body.longDesc,
                "supplier": req.body.supplier,
                "cost": cost,
                "listPrice": req.body.listPrice || 0,
                "totalRepairCost": totalRepairCost,
                "notes": req.body.notes,
                "ebayNoReserve": req.body.ebayNoReserve,
                "inventoryItem": req.body.inventoryItem,
                "seller": req.body.seller,
                "sellerType": req.body.sellerType,
                "lastUpdated": Date.now(),
                "status": req.body.status,
                "search": req.body.itemNumber + " " + req.body.title + " " + req.body.serialNo + " " + req.body.modelNumber + historySearchTerm

            }
        }, {
            upsert: true
        }, function (err, doc) {
            if (err) return res.send(500, {
                error: err
            });
            return res.send("successfully saved");
        });

    } else {  // create new product

        var title =  req.body.title;
        if(title==null && req.body.history!=null)title = req.body.history.itemReceived;  // if new log item, use first 'itemReceived' for title


        var product = new Product();
        product.itemNumber = req.body.itemNumber;
        product.title = title;
        product.productType = req.body.productType;
        product.manufacturer = req.body.manufacturer;
        product.paymentAmount = paymentAmount;
        product.paymentMethod = req.body.paymentMethod;
        product.paymentDetails = req.body.paymentDetails;
        product.model = req.body.model;
        product.modelNumber = req.body.modelNumber;
        product.condition = req.body.condition;
        product.gender = req.body.gender;
        product.features = req.body.features;
        product.case = req.body.case;
        product.size = req.body.size;
        product.dial = req.body.dial;
        product.bracelet = req.body.bracelet;
        product.comments = req.body.comments;
        product.serialNo = req.body.serialNo;
        product.longDesc = req.body.longDesc;
        if (product.longDesc == null) product.longDesc = title;
        product.supplier = req.body.supplier;
        product.cost = cost;
        product.listPrice = req.body.listPrice || 0;
        product.totalRepairCost = totalRepairCost;
        product.notes = req.body.notes;
        product.ebayNoReserve = req.body.ebayNoReserve;
        product.inventoryItem = req.body.inventoryItem;
        product.seller = req.body.seller;
        product.sellerType = req.body.sellerType;
        product.lastUpdated = Date.now();
        product.status = req.body.status;
        product.received = new Date();
        product.receivedBy = req.body.receivedBy;
        product.receivedFrom = req.body.receivedFrom;
        product.customerName = req.body.customerName;
        product.search = product.itemNumber + " " + product.title + " " + product.serialNo + " " + product.modelNumber;


        product.history = history;

        product.save(function (err) {
            if (err) {
                console.log('error saving product: ' + err);
                res.send(err);
            } else {
                res.json({
                    message: 'product saved'
                });
            }
        });
    }
}

router.route('/instock')

    .get(checkJwt, function (req, res) {

        var query = "";
        var status = 'In Stock';
        //var status = req.query.status;

        if (status != null) {

            Product.find({
                'status': status
            }, function (err, products) {
                if (err) res.send(err);
                res.json(products);
            });
            query = "status:" + status;
        } else {
            Product.find({}, function (err, products) {
                if (err) res.send(err);
                res.json(products);
            });
        }
    });

router.route('/products')
    .post(checkJwt, function (req, res) {

        if (req.body._id == null) {
            if (req.body.sellerType == 'Partner') {
                req.body.status = 'Partnership';
            } else {
                req.body.status = 'In Stock';
            }


            if(req.body.itemNumber == null){ // new
                console.log('no item number, creating new log item');
                return upsertProduct(req, res, null, "product created");
            }

            else{
                console.log('item  specified, looking for existing item');

                Product.findOne({ 'itemNumber': req.body.itemNumber }, '_id lastUpdated', function (err, product) {
                    if (err)  return res.send(500, {
                        error: err
                    });

                    else if(product!=null) {
                        console.log('found existing product with itemNumber ' + req.body.itemNumber);

                        if(req.body.history == null || req.body.history.itemReceived == null) {

                            var errorMessage = 'error: trying to create new product with existing itemNumber, but not a log item';
                            console.log(errorMessage);

                            // return conflict response
                            return res.send(409, {
                                error: errorMessage
                            });



                             //res.send('product with item number ' + req.body.itemNumber + ' already exists');
                        }
                        else {
                            console.log("creating new log item for existing item");
                            return upsertProduct(req, res, product._id, "updating product " + product._id);
                        }


                    }else{
                        console.log('didnt find existing product with itemNumber ' + req.body.itemNumber);

                        return upsertProduct(req, res, null, "entered");
                    }
                });
            }


        } else { // update existing item
            return upsertProduct(req, res, req.body._id, "product updated");
        }
    })

    //.get(checkJwt, function(req, res) {
    .get(function (req, res) {

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
            statusFilter = {
                $eq: status
            };
        } else {
            statusFilter = {
                $ne: "Deleted"
            };
        }

        var sortOrder = -1;

        var sortColumn = req.query.order[0]['column'];


        if ("asc" == req.query.order[0]['dir'])
            sortOrder = 1;

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

                var statusBadge = "";

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
                if (err)
                    res.send(err);
                res.json(product);
            });
        }
    })

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
    .get(function (req, res) {

        console.log('getting log items');

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
            statusFilter = {
                $eq: status
            };
        } else {
            statusFilter = {
                $ne: "Deleted"
            };
        }

        var sortClause = {"history.date": -1};

        Product.
        aggregate([{ $match: {$and: [
            {status: statusFilter},
            {'history.action': 'received'},
            {'history.search': new RegExp(search, 'i')}
                ]}   }]).
        unwind('history').sort(sortClause).skip(parseInt(start)).limit(parseInt(length))
            .exec(function (err, products) {

            for (var i = 0; i < products.length; i++) {

                var badgeStyle = "default"; // grey
                if (products[i].status == 'In Stock' || products[i].status == 'Partnership' || products[i].status == 'Problem')
                    badgeStyle = "success"; // green
                else if (products[i].status == 'Repair' || products[i].status == 'Memo' || products[i].status == 'At Show')
                    badgeStyle = "warning" // yellow
                else if (products[i].status == 'Sale Pending')
                    badgeStyle = "danger" // red

                var itemReceived = "";

                if(products[i].itemNumber!=null){
                    itemReceived += products[i].itemNumber +": ";
                }

                if(products[i].history.itemReceived!=null) {
                    itemReceived += products[i].history.itemReceived;
                }else{
                    itemReceived += products[i].title;
                }

                results.data.push(
                    [
                        '<a href=\"#\" onclick=\"selectProduct(\'' + products[i].history._id + '\');return false;\">' + format('yyyy-MM-dd', products[i].history.date) + '</a>',
                        products[i].history.receivedFrom,
                        products[i].history.customerName,
                        itemReceived,
                        products[i].history.user,
                        products[i].history.comments
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
