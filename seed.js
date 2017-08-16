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
    status: "In Stock",
    notes: "9/16/16: All fixed, thanks!",
    seller: "Brian Kittrel",
    sellerType: "Individual",
    ebayNoReserve: false,
    inventoryItem: false
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
    status: "In Stock",
    notes: "9/16/14: All fixed, thanks!",
    seller: "Pastime",
    sellerType: "Consignment",
    ebayNoReserve: false,
    inventoryItem: true

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
    status: "In Stock",
    notes: "9/4/16: All fixed, thanks!",
    seller: "BTI",
    sellerType: "Partner",
    ebayNoReserve: true,
    inventoryItem: false
});













db.invoices.save({
    _id: ObjectId("100000000000000000000006"),
    customer: 'Mark Watney',
    project: "View Ridge Home Staging",
    invoiceNumber: "5275",
    date: "October 11, 2015",
    shipVia: "UPS",
    paidBy: "Card",
    total: "$350.50",
    paymentId: "10023",
    salesPerson: "David Knoernschild",
    invoiceType: "Advanced",
    shipToName: "Mark Watney",
    shipAddress1: "1300 Eagle Ridge Drive",
    shipAddress2: "",
    shipAddress3: "",
    shipCity: "Renton",
    shipState: "WA",
    shipZip: "98055",
    lineItems: [
        {
            name:"Living Room",
            _id: ObjectId("100000000000000000000007"),
            amount:500
        },
        {
            name:"Art/Accessories",
            _id: ObjectId("100000000000000000000008"),
            amount:100
        }
    ],
    subtotal: "600",
    tax: "60",
    shipping: "0",
    total: "660"
});


db.invoices.save({
    _id: ObjectId("100000000000000000000007"),
    customer: 'Melissa Lewis',
    project: "Wedgewood Home Staging",
    invoiceNumber: "5273",
    date: "October 5, 2015",
    shipVia: "USPS",
    paidBy: "Check",
    total: "$1200.00",
    paymentId: "10023",
    salesPerson: "David Knoernschild",
    invoiceType: "Basic",
    shipToName: "Mark Watney",
    shipAddress1: "1300 Eagle Ridge Drive",
    shipAddress2: "",
    shipAddress3: "",
    shipCity: "Renton",
    shipState: "WA",
    shipZip: "98055",
    lineItems: [
        {
            name:"Living room",
            _id: ObjectId("100000000000000000000027"),
            amount:450
        },
        {
            name:"Dining room",
            _id: ObjectId("100000000000000000000028"),
            amount:300
        },
        {
            name:"Bedroom",
            _id: ObjectId("100000000000000000000029"),
            amount:200
        },
        {
            name:"Kitchen/bath",
            _id: ObjectId("100000000000000000000030"),
            amount:200
        },
        {
            name:"Art/accessories",
            _id: ObjectId("100000000000000000000031"),
            amount:100
        }
    ],
    subtotal: "1250",
    tax: "125",
    shipping: "0",
    total: "1375"
});







db.invoices.save({
    _id: ObjectId("100000000000000000000008"),
    customer: 'Beth Johanssen',
    project: "North Seatle Town Home Staging",
    invoiceNumber: "5264",
    date: "September 27, 2015",
    shipVia: "FedEx",
    paidBy: "Cash",
    total: "$795.00",
    paymentId: "10023",
    salesPerson: "David Knoernschild",
    invoiceType: "Basic",
    shipToName: "Mark Watney",
    shipAddress1: "1300 Eagle Ridge Drive",
    shipAddress2: "",
    shipAddress3: "",
    shipCity: "Renton",
    shipState: "WA",
    shipZip: "98055",
    lineItems: [
        {
            name:"Living room/kitchen",
            _id: ObjectId("100000000000000000000041"),
            amount:430
        },
        {
            name:"Bedroom",
            _id: ObjectId("100000000000000000000042"),
            amount:200
        },
        {
            name:"Art",
            _id: ObjectId("100000000000000000000043"),
            amount:100
        }
    ],
    subtotal: "730",
    tax: "73",
    shipping: "0",
    total: "803"
});





db.counters.insert(
    {
        _id: "invoiceNumber",
        seq: 6000
    }
);

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
