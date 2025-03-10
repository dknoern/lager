WORKDIR=~/Documents/demesy/backups/latest
#DB=mongodb://localhost:27017
DB=mongodb+srv://user:Ec7ZPVnQIuuAlDil@demesy-test.4e7jdgt.mongodb.net



#mongosh lager --eval "db.dropDatabase()"

mongoimport --uri=$DB/lager -c counters --file $WORKDIR/counters.json
mongoimport --uri=$DB/lager -c customers --file $WORKDIR/customers.json
mongoimport --uri=$DB/lager -c products --file $WORKDIR/products.json
mongoimport --uri=$DB/lager -c invoices --file $WORKDIR/invoices.json
mongoimport --uri=$DB/lager -c repairs --file $WORKDIR/repairs.json
mongoimport --uri=$DB/lager -c returns --file $WORKDIR/returns.json
mongoimport --uri=$DB/lager -c logs --file $WORKDIR/logs.json
mongoimport --uri=$DB/lager -c outs --file $WORKDIR/outs.json
