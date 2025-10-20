var express = require('express');
var router = express.Router();
var Customer = require('../models/customer');
var Product = require('../models/product');
var Repair = require('../models/repair');
var Return = require('../models/return');
var Invoice = require('../models/invoice');
const checkJwt = require('./jwt-helper').checkJwt;
var format = require('date-format');
var formatCurrency = require('format-currency');

function formatMoney(value) {
    if (value == null || value == "") return "";
    else return formatCurrency(value, { format: '%s%v', code: "", symbol: '$' });
}

function getBySellerType(sellerType, res) {
    var results = {
        "data": []
    };
    Product.find({
        "sellerType": sellerType
    }, function (err, products) {

        if (err)
            res.send(err);

        for (var i = 0; i < products.length; i++) {

            results.data.push(
                [
                    products[i].seller,
                    format('yyyy-MM-dd', products[i].lastUpdated),
                    products[i].itemNumber,
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
        itemNumber: 1,
        title: 1,
        cost: 1,
        sellingPrice: 1
    });
}

router.use(function (req, res, next) {
    next();
});

router.route('/reports/vendors-with-outstanding-repairs')
    .get(checkJwt, function (req, res) {

        var vendorList = new Array();

        vendorList.push("All");

        Repair.find({
            'returnDate': null

        }, function (err, vendors) {
            if (err)
                res.send(err);

            for (var i = 0; i < vendors.length; i++) {

                if (!vendorList.includes(vendors[i].vendor))
                    vendorList.push(vendors[i].vendor);
            }

            res.json(vendorList);

        }).sort({
            vendor: 1
        }).select({
            vendor: 1
        });
    });

router.route('/reports/outstanding-repairs/:vendor')
    .get(checkJwt, function (req, res) {

        var vendor = req.params.vendor.toLowerCase();

        if (vendor == "all") vendor = "";

        var results = {
            "data": []
        };

        Repair.find({
            'returnDate': null,
            'search': new RegExp(vendor, 'i')

        }, function (err, repairs) {
            if (err)
                res.send(err);

            for (var i = 0; i < repairs.length; i++) {
                results.data.push(
                    [
                        repairs[i].repairNumber,
                        repairs[i].itemNumber,
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
            itemNumber: 1,
            repairNumber: 1,
            vendor: 1,
            description: 1,
            dateOut: 1
        });
    });

router.route('/reports/products-memo')
    .get(checkJwt, function (req, res) {
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
                        products[i].itemNumber,
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
            //_id: 1,
            itemNumber: 1,
            title: 1,
            seller: 1,
            lastUpdated: 1
        });
    });

router.route('/reports/daily-sales/:year/:month/:day')
    .get(checkJwt, function (req, res) {
        var year = parseInt(req.params.year);
        var month = parseInt(req.params.month);
        var day = parseInt(req.params.day);

        var results = {
            "data": []
        };
        Invoice.find({
            "date": {
                $gte: new Date(year, month - 1, day),
                $lt: new Date(year, month - 1, day + 1)
            },
            "invoiceType": { $nin: ["Partner", "Consignment"] }
        }, function (err, invoices) {

            if (err)
                res.send(err);

            for (var i = 0; i < invoices.length; i++) {

                for (var j = 0; j < invoices[i].lineItems.length; j++) {


                    var itemNo = "";
                    var title = "";

                    if (invoices[i].lineItems != null && invoices[i].lineItems.length > 0) {
                        itemNo = invoices[i].lineItems[j].itemNumber;
                        title = invoices[i].lineItems[j].name
                    }

                    results.data.push(
                        [
                            itemNo,
                            format('yyyy-MM-dd', invoices[i].date),
                            title,
                            invoices[i].salesPerson,
                            invoices[i].methodOfSale,
                            invoices[i].invoiceType
                        ]
                    );
                }
            }
            res.json(results);
        }).sort({
            date: -1
        }).select({
            date: 1,
            lineItems: 1,
            salesPerson: 1,
            methodOfSale: 1,
            invoiceType: 1
        });
    });

router.route('/reports/log-items/:year/:month/:day')
    .get(checkJwt, function (req, res) {
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
                        "<a href=\"/app/logs/" + logItems[i].id + "\">" + logItems[i].title + "</a>",
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
    .get(checkJwt, function (req, res) {

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
                    itemId = returns[i].lineItems[0].itemNumber;

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

router.route('/reports/items/sellertype/:sellerType')
    .get(checkJwt, function (req, res) {
        var sellerType = req.params.sellerType;

        var results = {
            "data": []
        };
        Product.find({
            "sellerType": sellerType
        }, function (err, products) {

            if (err)
                res.send(err);

            for (var i = 0; i < products.length; i++) {

                results.data.push(
                    [
                        products[i].seller,
                        format('yyyy-MM-dd', products[i].lastUpdated),
                        products[i].itemNumber,
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
            itemNumber: 1,
            title: 1,
            cost: 1,
            sellingPrice: 1
        });
    });

router.route('/reports/monthly-sales/:year/:month')
    .get(checkJwt, function (req, res) {

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
                    itemId = invoices[i].lineItems[0].itemNumber;
                    description = invoices[i].lineItems[0].name;
                }

                results.data.push(
                    [
                        invoices[i].customerFirstName + " " + invoices[i].customerLastName,
                        invoices[i].customerEmail,
                        '<div style="white-space: nowrap;">' + format('yyyy-MM-dd', invoices[i].date) + '</div>',
                        formatCurrency(invoices[i].total),
                        itemId,
                        description,
                        '<div style="white-space: nowrap;">' + invoices[i].salesPerson + '</div>',
                        invoices[i].shipState
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
            lineItems: 1,
            salesPerson: 1,
            shipState: 1
        });
    });

router.route('/reports/out-at-show')
    .get(checkJwt, function (req, res) {
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
                        products[i].itemNumber,
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
            lastUpdated: 1,
            itemNumber: 1
        });
    });

router.route('/reports/in-stock')
    .get(checkJwt, function (req, res) {

        var results = {
            "data": []
        };

        Product.find({
            $and: [{
                status: { $in: ["In Stock", "Partnership", "Consignment"] }
            },
            { itemNumber: { $ne: null } }
            ]
        }, function (err, products) {

            if (err)
                res.send(err);

            for (var i = 0; i < products.length; i++) {

                results.data.push(
                    [
                        products[i].itemNumber,
                        products[i].title,
                        products[i].productType,
                        "<span class=\"badge bg-success\">" + products[i].status + "</span>",
                        format('yyyy-MM-dd', products[i].lastUpdated),
                        products[i].seller
                    ]
                );
            }
            res.json(results);
        }).sort({
            lastUpdated: -1
        }).select({
            _id: 1,
            title: 1,
            lastUpdated: 1,
            itemNumber: 1,
            seller: 1,
            status: 1,
            productType: 1
        });
    });

router.route('/reports/show-report')
    .get(checkJwt, function (req, res) {

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
                        products[i].itemNumber,
                        products[i].title,
                        formatMoney(products[i].cost),
                        formatMoney(products[i].listPrice),
                        formatMoney(products[i].sellingPrice),
                        products[i].serialNo
                    ]
                );
            }
            res.json(results);
        }).sort({
            lastUpdated: -1
        }).select({
            _id: 1,
            title: 1,
            lastUpdated: 1,
            itemNumber: 1,
            cost: 1,
            listPrice: 1,
            sellingPrice: 1,
            serialNo: 1
        });
    });

router.route('/reports/first-sale-date')
    .get(checkJwt, function (req, res) {

        Invoice.findOne({}, function (err, invoice) {

            if (err)
                res.send(err);
            var dateString = format('yyyy/MM/dd', invoice.date);
            res.json(dateString);
        }).sort({
            date: 1
        }).select({
            date: 1
        });
    });

router.route('/reports/last-sale-date')
    .get(checkJwt, function (req, res) {
        Invoice.findOne({}, function (err, invoice) {
            if (err)
                res.send(err);
            var dateString = format('yyyy/MM/dd', invoice.date);
            res.json(dateString);
        }).sort({
            date: -1
        }).select({
            date: 1
        });
    });

router.route('/reports/customers')
    .get(checkJwt, function (req, res) {
        var results = {
            "data": []
        };

        Customer.find({
        }, function (err, customers) {
            if (err)
                res.send(err);

            for (var i = 0; i < customers.length; i++) {

                var cityAndState = customers[i].city;
                if (customers[i].state != null && customers[i].state != "") {
                    cityAndState += ', ' + customers[i].state;
                }

                results.data.push(
                    [
                        customers[i]._id,
                        customers[i].firstName + ' ' + customers[i].lastName,
                        cityAndState,
                        customers[i].email,
                        customers[i].phone,
                        customers[i].company
                    ]
                );
            }

            res.json(results);
        }).sort({
            _id: -1
        }).select({
            firstName: 1,
            lastName: 1,
            city: 1,
            state: 1,
            email: 1,
            phone: 1,
            company: 1
        });
    });

module.exports = router;
