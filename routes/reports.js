var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Repair = require('../models/repair');
var Return = require('../models/return');
var Invoice = require('../models/invoice');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');

router.use(function (req, res, next) {
    next();
});

router.route('/reports/outstanding-repairs')
    .get(function (req, res) {
        var results = {
            "data": []
        };

        Repair.find({
            'returnDate': null

        }, function (err, repairs) {
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
    .get(function (req, res) {
        var results = {
            "data": []
        };

        Product.find({
            'status': 'Memo'
        }, function (err, products) {

            if (err)
                res.send(err);

            for (var i = 0; i < products.length; i++) {

                results.data.push(
                    [
                        products[i]._id,
                        products[i].title,
                        products[i].seller,
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
            seller: 1,
            lastUpdated: 1
        });
    });

router.route('/reports/daily-sales/:year/:month/:day')
    .get(function (req, res) {
        var year = parseInt(req.params.year);
        var month = parseInt(req.params.month);
        var day = parseInt(req.params.day);

        var results = {
            "data": []
        };
        Invoice.find({
            //  "status": "Sold",
            "date": {
                $gte: new Date(year, month - 1, day),
                $lt: new Date(year, month - 1, day + 1)
            }
        }, function (err, invoices) {

            if (err)
                res.send(err);

            for (var i = 0; i < invoices.length; i++) {

                var itemNo = "";
                var title = "";

                if (invoices[i].lineItems != null && invoices[i].lineItems.length > 0) {
                    itemNo = invoices[i].lineItems[0].productId;
                    title = invoices[i].lineItems[0].name
                }

                results.data.push(
                    [
                        itemNo,
                        format('yyyy-MM-dd', invoices[i].date),
                        title,
                        invoices[i].salesPerson,
                        invoices[i].methodOfSale
                    ]
                );
            }
            res.json(results);
        }).sort({
            date: -1
        }).select({
            date: 1,
            lineItems: 1,
            salesPerson: 1,
            methodOfSale: 1
        });
    });



router.route('/reports/log-items/:year/:month/:day')
    .get(function (req, res) {
        var year = parseInt(req.params.year);
        var month = parseInt(req.params.month);
        var day = parseInt(req.params.day);

        var results = {
            "data": []
        };
        Product.find({
            "received": {
                $gte: new Date(year, month - 1, day),
                $lt: new Date(year, month - 1, day + 1)
            }
        }, function (err, logItems) {

            if (err)
                res.send(err);

            for (var i = 0; i < logItems.length; i++) {

                results.data.push(
                    [
                        format('yyyy-MM-dd', logItems[i].date),
                        logItems[i].receivedFrom,
                        "<a href=\"/#/app/log-item/" + logItems[i].id +"\">" + logItems[i].title + "</a>",
                        logItems[i].receivedBy,
                        logItems[i].comments,
                    ]
                );
            }
            res.json(results);
        }).sort({
            date: -1
        }).select({
            _id: 1,
            received: 1,
            comments: 1,
            title: 1,
            receivedBy: 1,
            receivedFrom: 1
        });
    });





router.route('/reports/returns-summary/:year/:month')
    .get(function (req, res) {

        var year = parseInt(req.params.year);
        var month = parseInt(req.params.month);

        var results = {
            "data": []
        };
        Return.find({
            "returnDate": {
                $gte: new Date(year, month - 1, 1),
                $lte: new Date(year, month, 1)
            }
        }, function (err, returns) {

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
    .get(function (req, res) {
        var results = {
            "data": []
        };
        Product.find({
            "sellerType": "Partner"
        }, function (err, products) {

            if (err)
                res.send(err);

            for (var i = 0; i < products.length; i++) {

                results.data.push(
                    [
                        products[i].seller,
                        format('yyyy-MM-dd', products[i].lastUpdated),
                        products[i]._id,
                        products[i].title,
                        '$' + products[i].cost,
                        '$' + products[i].sellingPrice
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


router.route('/reports/monthly-sales/:year/:month')
    .get(function (req, res) {

        var year = parseInt(req.params.year);
        var month = parseInt(req.params.month);
        var results = {
            "data": []
        };
        Invoice.find({
            //"invoiceType": "Invoice",
            "date": {
                $gte: new Date(year, month - 1, 1),
                $lte: new Date(year, month, 1)
            }

        }, function (err, invoices) {

            if (err)
                res.send(err);

            for (var i = 0; i < invoices.length; i++) {

                var itemId = "";
                var description = "";
                if (invoices[i].lineItems != null && invoices[i].lineItems.length > 0) {
                    itemId = invoices[i].lineItems[0].productId;
                    description = invoices[i].lineItems[0].name;
                }

                results.data.push(
                    [
                        invoices[i].customerFirstName + " " + invoices[i].customerLastName,
                        invoices[i].customerEmail,
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
            customerFirstName: 1,
            customerLastName: 1,
            date: 1,
            customerEmail: 1,
            _id: 1,
            total: 1,
            lineItems: 1
        });
    });


router.route('/reports/out-at-show')
    .get(function (req, res) {
        var results = {
            "data": []
        };

        Product.find({
            'status': 'At Show'
        }, function (err, products) {

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


router.route('/reports/show-report')
    .get(function (req, res) {
        var results = {
            "data": []
        };

        Product.find({
            'status': 'At Show'
        }, function (err, products) {

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


router.route('/reports/first-sale-date')
    .get(function (req, res) {

        Invoice.findOne({}, function (err, invoice) {

            if (err)
                res.send(err);
            var dateString = format('yyyy/MM/dd', invoice.date);
            console.log("date string is " + dateString);

            res.json(dateString);
        }).sort({
            date: 1
        }).select({
            date: 1
        });
    });


router.route('/reports/last-sale-date')
    .get(function (req, res) {

        Invoice.findOne({}, function (err, invoice) {

            if (err)
                res.send(err);
            var dateString = format('yyyy/MM/dd', invoice.date);
            console.log("date string is " + dateString);

            res.json(dateString);
        }).sort({
            date: -1
        }).select({
            date: 1
        });
    });

module.exports = router;
