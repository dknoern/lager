var mongoose     = require('mongoose');

var ProductSchema   = new mongoose.Schema({

	    itemNo: Number,
	    productType: String,
	    manufacturer: String,
	    title: String,
		paymentAmount: String,
		paymentMethod: String,
		paymentDetails: String,
	    style: String,
		model: String,
		condition: String,
		gender: String,
		features: String,
		case: String,
		size: String,
 		dial: String,
		bracelet: String,
		comments: String,
		serialNo: String,
		modelYear: String,
		longDesc: String,
		supplier: String,
		lastUpdated: String,
		userId: String,
		cost: String,
		listPrice: String,
		ourPrice: String,
		repairCost: String,
		photo: String,
		saleDate: String,
		received: String,
		statusId: String,
		notes: String,
		ebayNoReserve: Boolean,
		inventoryItem: Boolean,
		sellerType: String,
		seller: String
});

module.exports = mongoose.model('Product', ProductSchema);



