var express = require('express');
var router = express.Router();
var Product = require('../models/product');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

router.use(function(req, res, next) {
    next();
});

var upsertProduct = function(req, res, productId, action) {
    var paymentAmount = req.body.paymentAmount || 0;
    var totalRepairCost = req.body.totalRepairCost || 0;
    var cost = paymentAmount + totalRepairCost;

    if(productId!=null) {

        Product.findOneAndUpdate({
            _id: productId
        }, {

            "$push": {
                "history": {
                    user: req.user['http://mynamespace/name'],
                    date: Date.now(),
                    action: action
                }
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
                "receivedBy": req.body.receivedBy,
                "receivedFrom": req.body.receivedFrom,
                "customerName": req.body.customerName,
                "lastUpdated": Date.now(),
                "status": req.body.status,
                "search": req.body.itemNumbe + " " + req.body.title + " " + req.body.serialNo + " " + req.body.modelNumber

    }
        }, {
            upsert: true
        }, function (err, doc) {
            if (err) return res.send(500, {
                error: err
            });
            return res.send("successfully saved");
        });
    }else{
        var product = new Product();
        product.itemNumber = req.body.itemNumber;
        product.title = req.body.title;
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
        if(product.longDesc == null) product.longDesc = product.title;
        product.supplier = req.body.supplier;
        product.cost = cost;
        product.listPrice = req.body.listPrice || 0;
        product.totalRepairCost = totalRepairCost;
        product.notes = req.body.notes;
        product.ebayNoReserve = req.body.ebayNoReserve;
        product.inventoryItem = req.body.inventoryItem;
        product.seller = req.body.seller;
        product.sellerType = req.body.sellerType;
        product.lastUpdated =Date.now();
        product.status = req.body.status;
        product.received = new Date();
        product.receivedBy = req.body.receivedBy;
        product.receivedFrom = req.body.receivedFrom;
        product.customerName = req.body.customerName;
        product.search = product.itemNumber + " " + product.title + " " + product.serialNo + " " + product.modelNumber;


        product.history =
        {
            user:req.body.receivedBy,
                date: Date.now(),
                action: "received"
        };

        product.save(function(err) {
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

    .get(checkJwt, function(req, res) {

        var query = "";
        var status = 'In Stock';
        //var status = req.query.status;

        if (status != null) {

            Product.find({
                'status': status
            }, function(err, products) {
                if (err) res.send(err);
                res.json(products);
            });
            query = "status:" + status;
        } else {
            Product.find({}, function(err, products) {
                if (err) res.send(err);
                res.json(products);
            });
        }
    });

router.route('/products')
    .post(checkJwt, function(req, res) {

        if (req.body._id == null) {
            if (req.body.sellerType == 'Partner') {
                req.body.status = 'Partnership';
            } else {
                req.body.status = 'In Stock';
            }

            return upsertProduct(req, res, null, "product created");

        } else {
            return upsertProduct(req, res, req.body._id, "product updated");
        }
    })

    //.get(checkJwt, function(req, res) {
    .get(function(req, res) {

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
        }else{
          statusFilter = {
            $ne: "Deleted"
          };
        }

        var sortOrder = -1;

        var sortColumn = req.query.order[0]['column'];


        if("asc" == req.query.order[0]['dir'])
            sortOrder = 1;

        var sortClause = {lastUpdated: sortOrder};

        if("0" == sortColumn)
            sortClause = {itemNumber: sortOrder};
        else if("1"==sortColumn)
            sortClause = {title: sortOrder};
        else if("2"==sortColumn)
            sortClause = {serialNo: sortOrder};
        else if("3"==sortColumn)
            sortClause = {modelNumber: sortOrder};
        else if("4"==sortColumn)
            sortClause = {status: sortOrder};

            Product.find({
                $and: [{
                    status: statusFilter
                },
                    {
                       itemNumber: {$ne:null}
                    }

                , {
                    'search': new RegExp(search, 'i')
                }]
            }, function(err, products) {

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
                }, function(err, count) {
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

                        }, function(err, count) {
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
    .get(checkJwt, function(req, res) {

        if (req.params.product_id) {
            Product.findById(req.params.product_id, function(err, product) {
                if (err)
                    res.send(err);
                res.json(product);
            });
        }
    })

    .put(checkJwt, function(req, res) {
        Product.findById(req.params.product_id, function(err, product) {
            if (err)
                res.send(err);
            product.itemNumber = req.body.itemNumber;
            product.serialNo = req.body.serialNo;
            product.title = req.body.title;
            product.sellingPrice = req.body.sellingPrice;
            product.save(function(err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'Product updated!'
                });
            });
        });
    })

    .delete(checkJwt, function(req, res) {

        Product.findById(req.params.product_id, function(err, product) {
            if (err)
                res.send(err);
            product.status = 'Deleted';
            product.save(function(err) {
                if (err)
                    res.send(err);
                res.json({
                    message: 'Product updated!'
                });
            });
        });

    });









router.route('/products/:product_id/status')
    .put(checkJwt, function(req, res) {

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
        }, function(err, doc) {
            if (err)
                res.send(err);
            res.json(responseData);
        });


    });




router.route('/products/:product_id/notes')
    .post(checkJwt, function(req, res) {

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
        }, function(err, doc) {
            if (err)
                res.send(err);
            else
                res.send('note successfully added');
        });

    })
    .get(checkJwt, function(req, res) {

        Product.findById(req.params.product_id, function(err, product) {
            if (err) {
                res.send(err);
            }else {
                res.json(product.history);
            }
        });

    });




module.exports = router;
