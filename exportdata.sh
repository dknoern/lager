ssh -f -o ExitOnForwardFailure=yes -l ubuntu -L 27018:localhost:27017 demesyinventory.com  sleep 10

DATE=`date "+%Y-%m-%d"`

BACKUPSDIR=~/Dropbox/demesy/backups
WORKDIR=${BACKUPSDIR}/${DATE}
rm ${BACKUPSDIR}/latest
ln -s $WORKDIR ${BACKUPSDIR}/latest
DB=mongodb://localhost:27018

mkdir $WORKDIR
mongoexport --uri=$DB/lager -c counters -o $WORKDIR/counters.json
mongoexport --uri=$DB/lager -c customers -o $WORKDIR/customers.json
mongoexport --uri=$DB/lager -c products -o $WORKDIR/products.json
mongoexport --uri=$DB/lager -c invoices -o $WORKDIR/invoices.json
mongoexport --uri=$DB/lager -c repairs -o $WORKDIR/repairs.json
mongoexport --uri=$DB/lager -c returns -o $WORKDIR/returns.json


rsync -azv ubuntu@demesyinventory.com:lager/uploads $BACKUPSDIR

