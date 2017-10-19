var mongoose     = require('mongoose');

var ProductSchema   = new mongoose.Schema({
  	_id: String,
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
		lastUpdated: Date,
		cost: Number,
		listPrice: Number,
		totalRepairCost: Number,
    sellingPrice: Number,
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
