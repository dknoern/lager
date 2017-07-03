var express = require('express');
var router = express.Router();

var Product = require('../models/product');

router.use(function (req, res, next) {
    next();
});

router.route('/products')
    .post(function (req, res) {

        var product = new Product();

        product._id = req.body._id
        product.itemNo = req.body.itemNo;
        product.title = req.body.title;

        if(product.title==null)
        return res.send(500, { error: 'title required'});
       
        product.productType = req.body.productType;
        product.manufacturer = req.body.manufacturer;
        product.title = req.body.title;
        product.paymentAmount = req.body.paymentAmount;
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
        product.modelYear = req.body.modelYear;
        product.longDesc = req.body.longDesc;
        product.supplier = req.body.supplier;
        //product.lastUpdated = req.body.lastUpdated;
        //product.userId = req.body.userId;
        product.cost = req.body.cost;
        product.listPrice = req.body.listPrice;
        product.repairCost = req.body.repairCost;
        //product.photo = req.body.photo;
        //product.saleDate = req.body.x;
        //product.received = req.body.x;
        //product.statusId = req.body.x;
        product.notes = req.body.notes;
        product.ebayNoReserve = req.body.ebayNoReserve;
        product.inventoryItem = req.body.inventoryItem;
        product.seller = req.body.seller;
        product.sellerType = req.body.sellerType;

        var query = { _id: product._id };
        Product.findOneAndUpdate(query, product, { upsert: true }, function (err, doc) {
            if (err) return res.send(500, { error: err });
            return res.send("succesfully saved");
        });
    })

    .get(function (req, res) {
        Product.find(function (err, products) {
            if (err)
                res.send(err);

            res.json(products);
        });
    });

router.route('/products/:product_id')
    .get(function (req, res) {

        if (req.params.product_id) {
            Product.findById(req.params.product_id, function (err, product) {
                if (err)
                    res.send(err);
                res.json(product);
            });
        }
    })

    .put(function (req, res) {
        Product.findById(req.params.product_id, function (err, product) {
            if (err)
                res.send(err);
            product.itemNo = req.body.itemNo;
            product.title = req.body.title;
            product.sellingPrice = req.body.sellingPrice;
            product.save(function (err) {
                if (err)
                    res.send(err);
                res.json({ message: 'Product updated!' });
            });
        });
    })

    .delete(function (req, res) {
        Product.remove({
            _id: req.params.product_id
        }, function (err, product) {
            if (err)
                res.send(err);
            res.json({ message: 'Successfully deleted' });
        });
    });

module.exports = router;
