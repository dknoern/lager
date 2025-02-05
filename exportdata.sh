DATE=`date "+%Y-%m-%d"`

BACKUPSDIR=~/Documents/demesy/backups
WORKDIR=${BACKUPSDIR}/${DATE}
rm ${BACKUPSDIR}/latest
ln -s $WORKDIR ${BACKUPSDIR}/latest
DB=mongodb://demesyinventory:27017

mkdir $WORKDIR
mongoexport --uri=$DB/lager -c counters -o $WORKDIR/counters.json
mongoexport --uri=$DB/lager -c customers -o $WORKDIR/customers.json
mongoexport --uri=$DB/lager -c products -o $WORKDIR/products.json
mongoexport --uri=$DB/lager -c invoices -o $WORKDIR/invoices.json
mongoexport --uri=$DB/lager -c repairs -o $WORKDIR/repairs.json
mongoexport --uri=$DB/lager -c returns -o $WORKDIR/returns.json
mongoexport --uri=$DB/lager -c logs -o $WORKDIR/logs.json
mongoexport --uri=$DB/lager -c outs -o $WORKDIR/outs.json


rsync -azv ubuntu@demesyinventory.com:lager/uploads $BACKUPSDIR

