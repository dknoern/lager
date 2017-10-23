var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Repair = require('../models/repair');
var Return = require('../models/return');
var Invoice = require('../models/invoice');
var Counter = require('../models/counter');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

router.use(function(req, res, next) {
    next();
});

router.route('/reports/outstanding-repairs')
    .get(function(req, res) {
        var results = {
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
        var results = {
            "data": []
        };

        Product.find({
            'status': 'Memo'
        }, function(err, products) {

            if (err)
                res.send(err);

            for (var i = 0; i < products.length; i++) {

                results.data.push(
                    [
                        products[i]._id,
                        products[i].title,
                        '',
                        format('yyyy-MM-dd', products[i].lastUpdated)
                    ]
                );
            }
            res.json(results);
        }).sort({
            lastUpdated: -1
        }).select({
            _id: 1,
            title: 1,
            lastUpdated: 1
        });
    });




router.route('/reports/daily-sales')
    .get(function(req, res) {
        var results = {
            "data": []
        };
        Product.find({
            "status": "Sold",
            "lastUpdated": {
                $gte: new Date(2013, 7, 8),
                $lte: new Date(2013, 7, 10)
            }
        }, function(err, products) {

            if (err)
                res.send(err);

            for (var i = 0; i < products.length; i++) {

                results.data.push(
                    [
                        products[i]._id,
                        format('yyyy-MM-dd', products[i].lastUpdated),
                        products[i].title,
                        products[i].supplier,
                        ''
                    ]
                );
            }
            res.json(results);
        }).sort({
            lastUpdated: -1
        }).select({
            _id: 1,
            lastUpdated: 1,
            title: 1,
            supplier: 1
        });
    });

router.route('/reports/returns-summary')
    .get(function(req, res) {
        var results = {
            "data": []
        };
        Return.find({
            "returnDate": {
                $gte: new Date(2017, 1, 1),
                $lte: new Date(2017, 7, 10)
            }
        }, function(err, returns) {

            if (err)
                res.send(err);

            for (var i = 0; i < returns.length; i++) {

                var itemId = "";
                if (returns[i].lineItems != null && returns[i].lineItems.length > 0)
                    itemId = returns[i].lineItems[0].productId;

                results.data.push(
                    [
                        itemId,
                        format('yyyy-MM-dd', returns[i].returnDate),
                        returns[i].customerName
                    ]
                );
            }
            res.json(results);
        }).sort({
            returnDate: -1
        }).select({
            lineItems: 1,
            returnDate: 1,
            customerName: 1
        });
    });






router.route('/reports/partnership-items')
    .get(function(req, res) {
        var results = {
            "data": []
        };
        Product.find({
            "sellerType": "Partner"
        }, function(err, products) {

            if (err)
                res.send(err);

            for (var i = 0; i < products.length; i++) {

                results.data.push(
                    [
                        products[i].seller,
                        format('yyyy-MM-dd', products[i].lastUpdated),
                        products[i]._id,
                        products[i].title,
                        products[i].cost,
                        ''
                    ]
                );
            }
            res.json(results);
        }).sort({
            lastUpdated: -1
        }).select({
            seller: 1,
            lastUpdated: 1,
            _id: 1,
            title: 1,
            cost: 1,
            sellingPrice: 1
        });
    });




router.route('/reports/monthly-sales')
    .get(function(req, res) {
        var results = {
            "data": []
        };
        Invoice.find({
            "invoiceType": "Invoice",
            "date": {
                $gte: new Date(2017, 1, 1),
                $lte: new Date(2017, 7, 10)
            }

        }, function(err, invoices) {

            if (err)
                res.send(err);

            for (var i = 0; i < invoices.length; i++) {

              var itemId = "";
              var description = "";
              if (invoices[i].lineItems != null && invoices[i].lineItems.length > 0){
                  itemId = invoices[i].lineItems[0].productId;
                  description = invoices[i].lineItems[0].productId;
                }

                console.log("date:"+invoices[i].date);

                results.data.push(
                    [
                        invoices[i].customerName,
                        invoices[i].email,
                        format('yyyy-MM-dd', invoices[i].date),
                        invoices[i].total,
                        itemId,
                        description
                    ]
                );
            }
            res.json(results);
        }).sort({
            date: -1
        }).select({
            customerName: 1,
            date: 1,
            email: 1,
            _id: 1,
            total: 1,
            lineItems: 1
        });
    });







module.exports = router;
