WORKDIR=~/Documents/demesy/backups/latest
DB=<MONGODBURI>

#mongosh lager --eval "db.dropDatabase()"


mongo $DB/lager  --eval "db.products.drop()"
mongo $DB/lager  --eval "db.customers.drop()"
mongo $DB/lager  --eval "db.invoices.drop()"
mongo $DB/lager  --eval "db.repairs.drop()"
mongo $DB/lager  --eval "db.returns.drop()"
mongo $DB/lager  --eval "db.logs.drop()"
mongo $DB/lager  --eval "db.outs.drop()"
mongo $DB/lager  --eval "db.counters.drop()"
mongo $DB/lager  --eval "db.tenants.drop()"

mongoimport --uri=$DB/lager -c counters --file $WORKDIR/counters.json
mongoimport --uri=$DB/lager -c customers --file $WORKDIR/customers.json
mongoimport --uri=$DB/lager -c products --file $WORKDIR/products.json
mongoimport --uri=$DB/lager -c invoices --file $WORKDIR/invoices.json
mongoimport --uri=$DB/lager -c repairs --file $WORKDIR/repairs.json
mongoimport --uri=$DB/lager -c returns --file $WORKDIR/returns.json
mongoimport --uri=$DB/lager -c logs --file $WORKDIR/logs.json
mongoimport --uri=$DB/lager -c outs --file $WORKDIR/outs.json
mongoimport --uri=$DB/lager -c tenants --file $WORKDIR/tenants.json
