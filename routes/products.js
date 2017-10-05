var express = require('express');
var router = express.Router();

var Product = require('../models/product');

const checkJwt = require('./jwt-helper').checkJwt;

router.use(function(req, res, next) {
    next();
});

router.route('/products')
    .post(checkJwt, function(req, res) {

        if (req.body.title == null)
            return res.send(500, {
                error: 'title required'
            });

        var query = {
            _id: req.body._id
        };

        console.log("id is " + req.body._id);

        var historyEntry = {
            user: req.user['http://mynamespace/name'],
            date: Date.now(),
            action: "updated product info "
        };

        Product.findOneAndUpdate(query, {
            "$push": {
                "history": historyEntry
            },
            "$set": {
                "title": req.body.title,
                "productType": req.body.productType,
                "manufacturer": req.body.manufacturer,
                "paymentAmount": req.body.paymentAmount,
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
                "cost": req.body.cost,
                "listPrice": req.body.listPrice,
                "repairCost": req.body.repairCost,
                "notes": req.body.notes,
                "ebayNoReserve": req.body.ebayNoReserve,
                "inventoryItem": req.body.inventoryItem,
                "seller": req.body.seller,
                "sellerType": req.body.sellerType
            }
        }, {
            upsert: true
        }, function(err, doc) {
            if (err) return res.send(500, {
                error: err
            });

            return res.send("succesfully saved");
        });


    })

    .get(checkJwt, function(req, res) {

        var query = "";
        var status = req.query.status;

        if (status != null) {

            Product.find({'status':status}, function(err, products) {
                if (err)
                    res.send(err);
                res.json(products);
            });
            query = "status:" + status;
        } else {
            Product.find({}, function(err, products) {
                if (err)
                    res.send(err);
                res.json(products);
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
