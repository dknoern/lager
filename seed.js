db.dropDatabase();


db.products.save({
    _id: ObjectId("200000000000000000000006"),
    itemNo: 43745,
    productType: "Watch",
    manufacturer: "Movado",
    title: "Timex Elite",
    paymentAmount: 350.05,
    paymentMethod: "Cash",
    paymentDetails: "Small bills",
    modelNumber: "16013",
    model: "Classic Wave",
    condition: "Pre-owned",
    gender: "Ladies",
    features: "Autowinding",
    case: "Steel",
    size: "38mm diameter",
    dial: "Radion",
    bracelet: "Extra springy",
    comments: "Rare find",
    serialNo: "9809898",
    modelYear: "2017",
    longDesc: "Timex Elinte",
    supplier: "Acme",
    lastUpdated: "12/16/2016 14:07:52",
    userId: "",
    cost: 1.01,
    listPrice: 2.02,
    repairCost: 4.04,
    photo: "x",
    saleDate: "",
    received: "2/21/2012 0:00:00",
    status: "AVAILABLE",
    notes: "9/16/16: All fixed, thanks!",
    seller: "Brian Kittrel",
    sellerType: "Individual",
    ebayNoReserve: false,
    inventoryItem: false,
    "history" : [{
      "action" : "item entered",
			"date" : Date.now(),
			"user" : "system",
			"_id" : ObjectId("000000000000000000000001")
    }]
});


db.products.save({
    _id: ObjectId("200000000000000000000007"),
    itemNo: 43746,
    productType: "Jewelry",
    manufacturer: "",
    title: "Bulova President",
    paymentAmount: 475.00,
    paymentMethod: "Card",
    paymentDetails: "Visa ending in 4033",
    modelNumber: "17544",
    model: "Omega",
    condition: "Unused",
    gender: "Men's",
    features: "Extra battery",
    case: "Gold",
    size: "38mm diameter",
    dial: "Backlit",
    bracelet: "Platinum",
    comments: "Good price",
    serialNo: "102312938",
    modelYear: "2017",
    longDesc: "Bulova President",
    supplier: 57686,
    lastUpdated: "12/16/2016 14:07:52",
    userId: "",
    cost: 1.01,
    listPrice: 2.02,
    repairCost: 4.04,
    photo: "x",
    saleDate: "",
    received: "2/21/2012 0:00:00",
    status: "AVAILABLE",
    notes: "9/16/14: All fixed, thanks!",
    seller: "Pastime",
    sellerType: "Consignment",
    ebayNoReserve: false,
    inventoryItem: true,
    "history" : [{
      "action" : "item entered",
			"date" : Date.now(),
			"user" : "system",
			"_id" : ObjectId("000000000000000000000001")
    }]

});


db.products.save({
    _id: ObjectId("200000000000000000000008"),
    itemNo: 43747,
    productType: "Watch",
    manufacturer: "Bvlgari",
    title: "Longiness Platinum 3",
    paymentAmount: 500.00,
    paymentMethod: "Check",
    paymentDetails: "Check number 3055",
    modelNumber: "12333",
    model: "Ladies President",
    condition: "Unused",
    gender: "Ladies",
    features: "Extra band",
    case: "Gold and silver",
    size: "40mm diameter",
    dial: "Glow in dark",
    bracelet: "Pearl and ruby",
    comments: "Got from downtown",
    serialNo: "9879887",
    modelYear: "2015",
    longDesc: "Longiness Platinum 3",
    supplier: 57686,
    lastUpdated: "12/16/2016 14:07:52",
    userId: "",
    cost: 1.01,
    listPrice: 2.02,
    repairCost: 4.04,
    photo: "x",
    saleDate: "",
    received: "2/21/2012 0:00:00",
    status: "AVAILABLE",
    notes: "9/4/16: All fixed, thanks!",
    seller: "BTI",
    sellerType: "Partner",
    ebayNoReserve: true,
    inventoryItem: false,
    "history" : [{
      "action" : "item entered",
			"date" : Date.now(),
			"user" : "system",
			"_id" : ObjectId("000000000000000000000001")
    }]
});











db.customers.save({
    _id: ObjectId("400000000000000000000010"),
    custNo: '10023',
    firstName: 'Rick',
    lastName: 'Martinez',
    email: 'rick@nasa.gov',
    phone: '2065551112',
    company: "NASA",
    address1: '325 Ash Ave',
    city: 'Ames',
    state: 'IA',
    zip: '50010'
});


db.customers.save({
    _id: ObjectId("400000000000000000000011"),
    custNo: '21002',
    firstName: 'Beth',
    lastName: 'Johanssen',
    email: 'beth@nasa.gov',
    phone: '2065551112',
    company: 'Burger King',
    address1: '1103 Raney Street',
    city: 'Hiawatha',
    state: 'IA',
    zip: '52402'
});


db.counters.insert(
    {
        _id: "invoiceNumber",
        seq: 6000
    });
db.counters.insert({
        _id: "returnNumber",
        seq: 2000
    });
db.counters.insert({
        _id: "productNumber",
        seq:100000
    });

    db.counters.insert({
            _id: "customerNumber",
            seq:4000
        });

function getNextSequence(name) {
   var ret = db.counters.findAndModify(
          {
            query: { _id: name },
            update: { $inc: { seq: 1 } },
            new: true
          }
   );

   return ret.seq;
}





db.repairs.save({
    _id: ObjectId("400000000000000000000010"),
    repairNumber: '57228',
    dateOut: '6/2/2017 0:00:00',
    expectedReturnDate: '6/16/2017 0:00:00',
    returnDate: '',
    itemNumber: '57228',
    description: 'Vintage Ladies Rolex 14k Yellow Gold Watch',
    repairIssues: '',
    vendor: 'Alex',
    customerName: '',
    phone: '',
    email: '',
    repairNotes: 'C.o.a., full service, refurbish, new set bridge.',
    cost: '125.00',
    hasPapers: false
  });


  db.repairs.save({
      _id: ObjectId("400000000000000000000011"),
      repairNumber: '58365',
      dateOut: '6/2/2017 0:00:00',
      expectedReturnDate: '6/16/2017 0:00:00',
      returnDate: '',
      itemNumber: '58365',
      description: 'Vintage Rolex Air-King Mens Stainless Steel Oyster Perpetual Watch 5500',
      repairIssues: 'Full service, c.o.a., refurbish, new crystal, new mainspring.',
      vendor: 'Alex',
      customerName: '',
      phone: '',
      email: '',
      repairNotes: 'Full service, c.o.a., refurbish, new crystal, new mainspring.',
      cost: '175.00',
      hasPapers: false
    });



  //repairId,dateOut,expectedReturnDate,returnDate,itemNo,description,repairIssues,vendor,customerName,phone,email,
  //repairNotes,cost,hasPapers

//"58529",6/2/2017 0:00:00,6/12/2017 0:00:00,6/7/2017 0:00:00,"58529","Rolex Datejust Men's Stainless Steel Watch 16220",,"Alex",,,,"Fix power reserve only - no charge.",$0.00,0
//"58842",6/2/2017 0:00:00,6/12/2017 0:00:00,,"58842","Cartier Tank Francaise Automatic Men's Stainless Steel Watch W51002Q3",,"Alex",,,,"Sent to  Alex on: 06/02/17",,0
//"58841",6/2/2017 0:00:00,6/12/2017 0:00:00,,"58841","Rolex Ladies Datejust 2-Tone Jubilee Diamond Watch 179173",,"Alex",,,,"Sent to  Alex on: 06/02/17",,1
//"58846",6/2/2017 0:00:00,6/12/2017 0:00:00,6/13/2017 0:00:00,"58846","Omega Steel Seamaster",,"Alex",,,,"Refurbish case and bracelet.",$75.00,0
//"58854",6/7/2017 0:00:00,6/17/2017 0:00:00,,"58854","Cartier Pasha 18k White Gold & Diamond Automatic 32mm Ladies Watch","Please service and rhodium","Swiss Connection",,,,"Sent to  Swiss Connection on: 06/07/17",,0
//"58874",6/13/2017 0:00:00,6/23/2017 0:00:00,,"58874","Rolex Datejust Men's Stainless Steel Watch 16220",,"Alex",,,,"Sent to  Alex on: 06/13/17",,0
//"58876",6/16/2017 0:00:00,6/26/2017 0:00:00,,"58876","Cartier Tank Americaine (or American) Ladies WG Diamond Watch WB7018L1",,"Alex",,,,"Sent to  Alex on: 06/16/17",,1
//"58868",6/16/2017 0:00:00,6/26/2017 0:00:00,,"58868","Rolex 2-Tone GMT-Master 16753",,"Alex",,,,"Sent to  Alex on: 06/16/17",,1
//"58887",6/19/2017 0:00:00,6/29/2017 0:00:00,,"58887","Men's Rolex Yacht-Master II Regatta 18k Yellow Gold Watch 116688","Fix nicks in bazel and refinish watch.","Kovacs",,,,"Sent to  Kovacs on: 06/19/17",,1
//"57364",6/7/2017 0:00:00,6/17/2017 0:00:00,,"57364","Cartier Tank Francaise Chronograph Men's 18k Gold Watch  W5000556","Warranty service - not running.  Just got it back from servise by you in March of this year.","Swiss Connection",,,,"Sent to  Swiss Connection on: 06/07/17",,0
//"58855",6/7/2017 0:00:00,6/8/2017 0:00:00,,"58855","Rolex Datejust Men's Stainless Steel Automatic Winding Watch 116200",,"Alex",,,,"Sent to  Alex on: 06/07/17",,0
//"58853",6/7/2017 0:00:00,6/8/2017 0:00:00,,"58853","Rolex 18k Yellow Gold Men's President 1803",,"Alex",,,,"Sent to  Alex on: 06/07/17",,0
//"58844",6/8/2017 0:00:00,6/18/2017 0:00:00,,"58845","Cartier Tank Francaise Men's 2-Tone Watch W51005Q4",,"Alex",,,,"Sent to  Alex on: 06/08/17",,0
