rm -fr ~/tmp/uploads

for file in `ls ~/Dropbox/demesy/backups/uploads/`;do

if [ "${#file}" -gt 24 ]
then
dir=`echo $file | cut -c 1-24`
image=`echo $file | cut -c 26-999`

echo "$file -> $dir : $image < ${#file}" 

mkdir -p ~/tmp/uploads/${dir}
cp ~/Dropbox/demesy/backups/uploads/$file ~/tmp/uploads/${dir}/${image}
fi
done
