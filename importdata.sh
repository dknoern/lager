WORKDIR=sample
DB=mongodb://localhost:27017

mongosh lager --eval "db.dropDatabase()"

mongoimport --uri=$DB/lager -c counters --file sample/records/counters.json
mongoimport --uri=$DB/lager -c customers --file sample/records/customers.json
mongoimport --uri=$DB/lager -c products --file sample/records/products.json
mongoimport --uri=$DB/lager -c invoices --file sample/records/invoices.json
mongoimport --uri=$DB/lager -c repairs --file sample/records/repairs.json
mongoimport --uri=$DB/lager -c returns --file sample/records/returns.json
mongoimport --uri=$DB/lager -c logs --file sample/records/logs.json
mongoimport --uri=$DB/lager -c outs --file sample/records/outs.json

rm uploads/*
cp sample/images/* uploads/.
