var Repair = require('./models/repair');
var mongoose = require('mongoose');
var format = require('date-format');

var emailAddresses = require('./email-addresses.js');

function formatDate(date) {
    if (date == null) return "";
    else {
        return format('yyyy-MM-dd', date);
    }
}

mongoose.connect('mongodb://localhost:27017/lager');

// load aws sdk
var aws = require('aws-sdk');

// load aws config
aws.config.loadFromPath('aws-credentials.js');

// load AWS SES
var ses = new aws.SES({
    apiVersion: '2010-12-01'
});

// send to list
var to = emailAddresses.to;
var bcc = emailAddresses.bcc;

console.log('to addresses = ' + to);
console.log('bcc addresses = ' + bcc);

// this must relate to a verified SES account
var from = 'Marijo@demesy.com'

function getOverdueRepairs() {

    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);

    var now = new Date();

    Repair.find({
        $and: [{
                'returnDate': null
            },
            {
                'dateOut': {
                    $gte: cutoff
                }
            },
            {
              'expectedReturnDate': {
                $lt: now
              }
            }
        ]

    }, function(err, repairs) {
        if (err)
            console.log(err);
        else {
          var resultsString = formatResults(repairs);
          mailResults(resultsString);
          mongoose.disconnect();

        }

    }).sort({
        expectedReturnDate: 1
    }).select({
        description: 1,
        dateOut: 1,
        expectedReturnDate: 1,
        returnDate: 1,
        customerFirstName: 1,
        customerLastName: 1,
        repairNumber: 1,
        vendor: 1
    });
}

console.log('getting overdue repairs');

getOverdueRepairs();


function formatResults(repairs)
{
  var s = "Demesy inventory system repair records check for " + formatDate(new Date()) +".\n\n"

  s += "There are " + repairs.length + " overdue repairs.\n";

  for (var i = 0; i < repairs.length; i++) {
    s += "\n";
    s += "Repair " + repairs[i].repairNumber + ": " + repairs[i].description + ", for customer ";
    s += repairs[i].customerFirstName + " " + repairs[i].customerLastName + ", expected return date was "
    s += formatDate(repairs[i].expectedReturnDate) +".";
  }

  s+='\n\n See all outstanding repairs at http://www.demesyinventory.com/#/app/repairs.'

  console.log(s);

  return s;
}

function mailResults(resultsString){
  ses.sendEmail( {
     Source: from,
     Destination: { ToAddresses: to,
     BccAddresses: bcc },
     Message: {
         Subject: {
            Data: 'Demesy overdue repair report'
         },
         Body: {
             Text: {
                 Data: resultsString,
             }/*,
             Html: {
               Data: 'Hi there, how are <b>you</b>?'
             }*/
          }
     }
  }
  , function(err, data) {
      if(err) throw err
          console.log('Email sent:');
          console.log(data);
   });

}
