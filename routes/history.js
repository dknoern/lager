var Product = require('../models/product');

module.exports.updateProductHistory = async function (lineItems, status, action, user, refDoc) {

    for (var i = 0; lineItems != null && i < lineItems.length; i++) {
        var lineItem = lineItems[i];

        if (lineItem.productId != null && lineItem.productId != '') {

            var historyEntry = {
                user: user,
                date: Date.now(),
                action: action
            };

            if (refDoc != null) {
                historyEntry.refDoc = refDoc;
            }

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
        }
    }
}
