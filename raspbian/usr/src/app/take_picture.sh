#!/bin/bash
export TZ=JST-9

# delete old picture
find /var/www/html/images -mtime 1 -name "*.jpg" | xargs rm -f

# 温度/気圧/湿度の取得
echo -n "checking current sensor data ... "
bme280=$(python /usr/src/app/bme280.py)
echo $bme280

# 時刻絵ベースで撮影して保存
echo "taking picture ... "
cd /var/www/html/images/
filename=$(date +%Y%m%d%H%M.jpg)
fswebcam -r 640x480 --title "$bme280" $filename

ln -sf /var/www/html/images/$filename /var/www/html/image.jpg
