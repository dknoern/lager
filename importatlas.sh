WORKDIR=~/Documents/demesy/backups/latest
DB=<MONGODBURI>

#mongosh lager --eval "db.dropDatabase()"

mongoimport --uri=$DB/lager -c counters --file $WORKDIR/counters.json
mongoimport --uri=$DB/lager -c customers --file $WORKDIR/customers.json
mongoimport --uri=$DB/lager -c products --file $WORKDIR/products.json
mongoimport --uri=$DB/lager -c invoices --file $WORKDIR/invoices.json
mongoimport --uri=$DB/lager -c repairs --file $WORKDIR/repairs.json
mongoimport --uri=$DB/lager -c returns --file $WORKDIR/returns.json
mongoimport --uri=$DB/lager -c logs --file $WORKDIR/logs.json
mongoimport --uri=$DB/lager -c outs --file $WORKDIR/outs.json
mongoimport --uri=$DB/lager -c tenants --file $WORKDIR/tenants.json
