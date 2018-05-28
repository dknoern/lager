DATE=`date "+%Y-%m-%d"`

BACKUPSDIR=~/Dropbox/demesy/backups
WORKDIR=${BACKUPSDIR}/${DATE}
ln -s $WORKDIR ${BACKUPSDIR}/latest
DB=mongodb://localhost:27018

mkdir $WORKDIR
mongoexport --uri=$DB/lager -c counters -o $WORKDIR/counters.json
mongoexport --uri=$DB/lager -c customers -o $WORKDIR/customers.json
mongoexport --uri=$DB/lager -c products -o $WORKDIR/products.json
mongoexport --uri=$DB/lager -c invoices -o $WORKDIR/invoices.json
mongoexport --uri=$DB/lager -c repairs -o $WORKDIR/repairs.json
mongoexport --uri=$DB/lager -c returns -o $WORKDIR/returns.json

