var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Counter = require('../models/counter');
const checkJwt = require('./jwt-helper').checkJwt;

router.use(function(req, res, next) {
    next();
});


var getNextSequence = function(){
  Counter.findByIdAndUpdate({_id: 'productId'}, {$inc: {seq: 1}}, function (error, counter) {
        return counter.seq;
    });
}

var upsertProduct = function(req,res,productId, action)
{
  var paymentAmount = req.body.paymentAmount || 0;
  var totalRepairCost = req.body.totalRepairCost || 0;
  var cost = paymentAmount + totalRepairCost;

  Product.findOneAndUpdate({_id: productId}, {

      "$push": {
          "history": {
              user: req.user['http://mynamespace/name'],
              date: Date.now(),
              action: action
          }
      },
      "$set": {
          "_id" : productId,
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
          "lastUpdated" : Date.now(),
          "status": req.body.status
      }
  }, {
      upsert: true
  }, function(err, doc) {
      if (err) return res.send(500, {error: err  });
      return res.send("succesfully saved");
  });
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
   console.log("looking for products with status=" + status);
});






router.route('/products')
    .post(checkJwt, function(req, res) {

        if (req.body._id == null) {
          if(req.body.sellerType == 'Partner'){
            req.body.status = 'Partnership';
          }else{
            req.body.status = 'In Stock';
          }
          Counter.findByIdAndUpdate({_id: 'productNumber'}, {$inc: {seq: 1}}, function (err, counter) {
                if (err){
                  console.log(err);
                  return res.send(500, {error: err  });
                }
                return upsertProduct(req,res,counter.seq,"product created");
          });
        }else{
          return upsertProduct(req,res,req.body._id,"product updated");
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
            "recordsTotal": 57,
            "recordsFiltered": 57,
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
                    if (products[i].status == 'In Stock' || products[i].status == 'Partnership' ||  products[i].status == 'Problem')
                      badgeStyle = "success"; // green
                    else if (products[i].status =='Repair' || products[i].status =='Memo' || products[i].status =='At Show')
                      badgeStyle = "warning" // yellow
                      else if (products[i].status =='Sale Pending')
                        badgeStyle = "danger" // red

                    results.data.push(
                        [
                            '<a href=\"/#/app/item/' + products[i]._id + '\">' + products[i]._id,
                            products[i].title,
                            products[i].serialNo,
                            products[i].modelNumber,
                             "<span class=\"badge bg-"+badgeStyle+"\">"+products[i].status+"</span>"
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
