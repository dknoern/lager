var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Repair = require('../models/repair');
var Counter = require('../models/counter');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

router.use(function(req, res, next) {
    next();
});

router.route('/reports/outstanding-repairs')
    .get(function(req, res) {
        var results = {
            //"draw": draw,
            //"recordsTotal": 0,
            //"recordsFiltered": 0,
            "data": []
        };

        Repair.find({
            'returnDate': null

        }, function(err, repairs) {
            if (err)
                res.send(err);

            for (var i = 0; i < repairs.length; i++) {
                results.data.push(
                    [
                        repairs[i].itemId,
                        repairs[i].vendor,
                        repairs[i].description,
                        format('yyyy-MM-dd', repairs[i].dateOut)
                    ]
                );
            }


            res.json(results);

        }).sort({
            dateOut: -1
        }).select({
            itemId: 1,
            vendor: 1,
            description: 1,
            dateOut: 1
        });
    });









router.route('/reports/products-memo')
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

        if (status != null) {

            Product.find({
                'status': status
            }, function(err, products) {
                if (err)
                    res.send(err);
                res.json(results);
            });
            query = "status:" + status;
        } else {

            //Product.find({'title': new RegExp(search, 'i') }, function(err, products) {
            Product.find({
                $or: [{
                        'title': new RegExp(search, 'i')
                    },
                    {
                        'serialNo': new RegExp(search, 'i')
                    },
                    {
                        'model': new RegExp(search, 'i')
                    }
                ]
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
                            '<a href=\"/#/app/item/' + products[i]._id + '\">' + products[i]._id,
                            products[i].title,
                            products[i].serialNo,
                            products[i].model,
                            "<span class=\"badge bg-" + badgeStyle + "\">" + products[i].status + "</span>",
                            "$" + products[i].cost
                        ]
                    );
                }

                Product.count({}, function(err, count) {
                    results.recordsTotal = count;

                    if (search == '' || search == null) {
                        results.recordsFiltered = count;
                        res.json(results);
                    } else {
                        Product.count({
                            $or: [{
                                    'title': new RegExp(search, 'i')
                                },
                                {
                                    'serialNo': new RegExp(search, 'i')
                                },
                                {
                                    'model': new RegExp(search, 'i')
                                }
                            ]
                        }, function(err, count) {
                            results.recordsFiltered = count;
                            res.json(results);
                        });
                    }
                });

            }).sort({
                lastUpdated: -1
            }).skip(parseInt(start)).limit(parseInt(length)).select({
                title: 1,
                cost: 1,
                serialNo: 1,
                model: 1,
                status: 1,
                productType: 1
            });
        }
        console.log("looking for products with status=" + status);


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
            product.itemNo = req.body.itemNo;
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
        Product.remove({
            _id: req.params.product_id
        }, function(err, product) {
            if (err)
                res.send(err);
            res.json({
                message: 'Successfully deleted'
            });
        });
    });

module.exports = router;
