var mongoose     = require('mongoose');

var ProductSchema   = new mongoose.Schema({

	  itemNo: Number,
	  productType: String,
	  manufacturer: String,
	  title: String,
		paymentAmount: Number,
		paymentMethod: String,
		paymentDetails: String,
	  modelNumber: String,
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
		longDesc: String,
		supplier: String,
		lastUpdated: String,
		userId: String,
		cost: Number,
		listPrice: Number,
		repairCost: Number,
		photo: String,
		saleDate: String,
		received: String,
		status: String,
		notes: String,
		ebayNoReserve: Boolean,
		inventoryItem: Boolean,
		sellerType: String,
		seller: String,

		history: [{
      user: String,
      date: Date,
      action: String
    }]
});

module.exports = mongoose.model('Product', ProductSchema);
