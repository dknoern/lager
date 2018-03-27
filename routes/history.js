var Product = require('../models/product');

module.exports.updateProductHistory = function(lineItems,status,action,user) {


    for (var i = 0; lineItems !=null &&i < lineItems.length; i++) {
        var lineItem = lineItems[i];

        console.log("product id " + lineItem.productId);

        Product.findById(lineItem.productId, function(err, product) {
            if (err) {
                console.log("error=" + err);
            }

            if(product==null){
              console.log("null product fund for line item " + lineItem.productId);
            }
            else{

            console.log("status " + product.status);

            if (product != null && product.status != status) {
                var historyEntry = {
                    user: user,
                    date: Date.now(),
                    action: action
                };

                console.log("updating product " + product._id);

                Product.findOneAndUpdate({
                    _id: product._id
                }, {
                    "$push": {
                        "history": historyEntry
                    },
                    "$set": {
                        "status": status,
                        "lastUpdated": new Date()
                    }
                }, {
                    upsert: true
                }, function(err, doc) {
                    if (err) {
                        console.log("ERROR UPDATING STATUS " + err);
                    }
                    console.log("updated product status to " + status);
                });
            }
          }
        });
    }
}
