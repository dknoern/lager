
db.invoices.drop();



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
    ]
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
    ]
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
    ]
});
