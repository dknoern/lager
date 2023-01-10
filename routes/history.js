var Product = require('../models/product');

module.exports.updateProductHistory = async function (lineItems, status, action, user, refDoc) {

    console.log("updatingProductHistory for ",JSON.stringify(lineItems),status,action,user,refDoc);



    for (var i = 0; lineItems != null && i < lineItems.length; i++) {
        var lineItem = lineItems[i];

        if (lineItem.productId != null) {

            var historyEntry = {
                user: user,
                date: Date.now(),
                action: action
            };

            if (refDoc != null) {
                historyEntry.refDoc = refDoc;
            }

            console.log("updating product history for productId",lineItem.productId,"status",status);

            await Product.findOneAndUpdate({
                _id: lineItem.productId,
                status: { $ne: status }

            }, {
                "$push": {
                    "history": historyEntry
                },
                "$set": {
                    "status": status,
                    "lastUpdated": new Date()
                }
            }, {
                upsert: false, useFindAndModify: false
            });
            console.log('updated product', lineItem.productId,'history and set status to',status);
        }
    }
}
