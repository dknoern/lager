while true
do
        DATE=`date`
	echo starting lager at $DATE
	MONGO_URL=mongodb://localhost:27017/lager node server.js
        DATE=`date`
        echo lager stopped at $DATE
done
