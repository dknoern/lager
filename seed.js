db.dropDatabase();


db.products.save({
    _id: ObjectId("200000000000000000000006"),
    itemNo: 43745,
    productType: "Watch",
    manufacturer: "Movado",
    title: "Timex Elite",
    paymentAmount: "$350.00",
    paymentMethod: "Cash",
    paymentDetails: "Small bills",
    style: "16013",
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
    cost: "$1.01",
    listPrice: "$2.02",
    ourPrice: "$3.03",
    repairCost: "$4.04",
    photo: "x",
    saleDate: "",
    received: "2/21/2012 0:00:00",
    statusId: "4",
    notes: "9/16/16: All fixed, thanks!",
    seller: "Brian Kittrel",
    sellerType: "Normal",
    ebayNoReserve: false,
    inventoryItem: false
});


db.products.save({
    _id: ObjectId("200000000000000000000007"),
    itemNo: 43746,
    productType: "Jewelry",
    manufacturer: "",
    title: "Bulova President",
    paymentAmount: "$475.00",
    paymentMethod: "Card",
    paymentDetails: "Visa ending in 4033",
    style: "17544",
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
    cost: "$1.01",
    listPrice: "$2.02",
    ourPrice: "$3.03",
    repairCost: "$4.04",
    photo: "x",
    saleDate: "",
    received: "2/21/2012 0:00:00",
    statusId: 4,
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
    paymentAmount: "$500.00",
    paymentMethod: "Check",
    paymentDetails: "Check number 3055",
    style: "12333",
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
    cost: "$1.01",
    listPrice: "$2.02",
    ourPrice: "$3.03",
    repairCost: "$4.04",
    photo: "x",
    saleDate: "",
    received: "2/21/2012 0:00:00",
    statusId: 4,
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
    documentType: "INVOICE",
    date: "October 11, 2015",
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
    ]
});


db.invoices.save({
    _id: ObjectId("100000000000000000000007"),
    customer: 'Melissa Lewis',
    project: "Wedgewood Home Staging",
    invoiceNumber: "5273",
    documentType: "INVOICE",
    date: "October 5, 2015",
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
    ]
});







db.invoices.save({
    _id: ObjectId("100000000000000000000008"),
    customer: 'Beth Johanssen',
    project: "North Seatle Town Home Staging",
    invoiceNumber: "5264",
    documentType: "INVOICE",
    date: "September 27, 2015",
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
    ]
});






db.invoices.save({
    _id: ObjectId("100000000000000000000009"),
    customer: 'Chris Beck',
    project: "University District Home Staging",
    invoiceNumber: "5265",
    documentType: "INVOICE",
    date: "September 27, 2015",
    lineItems: [
        {
            name:"Staging",
            _id: ObjectId("100000000000000000000051"),
            amount:300
        }
    ]
});




db.invoices.save({
    _id: ObjectId("100000000000000000000010"),
    customer: 'Rick Martinez',
    project: "West Seattle Staging",
    invoiceNumber: "5263",
    documentType: "INVOICE",
    date: "September 1, 2015",
    lineItems: [
        {
            name:"Design recommendations",
            _id: ObjectId("100000000000000000000061"),
            amount:100
        },
        {
            name:"Dining room and design recommendations",
            _id: ObjectId("100000000000000000000062"),
            amount:250
        }
    ]
});

db.invoices.save({
    _id: ObjectId("100000000000000000000011"),
    customer: 'Alex Vogel',
    project: "Capital Hill Staging",
    invoiceNumber: "5256",
    documentType: "INVOICE",
    date: "July 24, 2015",
    lineItems: [
        {
            name:"Living Room",
            _id: ObjectId("100000000000000000000071"),
            amount:450
        },
        {
            name:"Kitchen",
            _id: ObjectId("100000000000000000000072"),
            amount:40
        },
        {
            name:"Bedroom",
            _id: ObjectId("100000000000000000000073"),
            amount:300
        },
        {
            name:"Bathroom",
            _id: ObjectId("100000000000000000000074"),
            amount:30
        },
        {
            name:"Art",
            _id: ObjectId("100000000000000000000075"),
            amount:100
        },
        {
            name:"Discount",
            _id: ObjectId("100000000000000000000076"),
            amount:-200
        }
    ]
});

db.counters.insert(
    {
        _id: "invoiceNumber",
        seq: 6000
    }
);







db.customers.save({
    _id: ObjectId("400000000000000000000010"),
    firstName: 'Rick',
    lastName: 'Martinez',
    email: 'rick@nasa.gov',
    phone: '2065551112'
});


db.customers.save({
    _id: ObjectId("400000000000000000000011"),
    firstName: 'Beth',
    lastName: 'Johanssen',
    email: 'beth@nasa.gov',
    phone: '2065551112'
});
