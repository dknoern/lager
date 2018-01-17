export WORKDIR=/tmp/demesycollections
rm -fr $WORKDIR
mkdir $WORKDIR
mongoexport -d lager -c customers -o $WORKDIR/customers.json
mongoexport -d lager -c products -o $WORKDIR/products.json
mongoexport -d lager -c invoices -o $WORKDIR/invoices.json
mongoexport -d lager -c repairs -o $WORKDIR/repairs.json
mongoexport -d lager -c returns -o $WORKDIR/returns.json

