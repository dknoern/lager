DB=mongodb://localhost:27017

rm sample/records/*
mongoexport --uri=$DB/lager -c counters -o sample/records/counters.json
mongoexport --uri=$DB/lager -c customers -o sample/records/customers.json
mongoexport --uri=$DB/lager -c products -o sample/records/products.json
mongoexport --uri=$DB/lager -c invoices -o sample/records/invoices.json
mongoexport --uri=$DB/lager -c repairs -o sample/records/repairs.json
mongoexport --uri=$DB/lager -c returns -o sample/records/returns.json
mongoexport --uri=$DB/lager -c logs -o sample/records/logs.json
mongoexport --uri=$DB/lager -c outs -o sample/records/outs.json

rm sample/images/*
cp uploads/* sample/images/.
