while true
do
        DATE=`date`
	echo starting lager at $DATE
	PORT=80 node server.js
        DATE=`date`
        echo lager stopped at $DATE
done
