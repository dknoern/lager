DATE=`date "+%Y-%M-%d"`
WORKDIR=~/Dropbox/demesy/backups/latest
DB=mongodb://localhost:27017

mongoimport --uri=$DB/lager -c counters --file $WORKDIR/counters.json
mongoimport --uri=$DB/lager -c customers --file $WORKDIR/customers.json
mongoimport --uri=$DB/lager -c products --file $WORKDIR/products.json
mongoimport --uri=$DB/lager -c invoices --file $WORKDIR/invoices.json
mongoimport --uri=$DB/lager -c repairs --file $WORKDIR/repairs.json
mongoimport --uri=$DB/lager -c returns --file $WORKDIR/returns.json

