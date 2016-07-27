# mai-cloud

[![タイムラプス動画](http://img.youtube.com/vi/w0w_pv3Z3lo/0.jpg)](https://www.youtube.com/watch?v=w0w_pv3Z3lo)

## 概要
- [ラズパイ x ソラコムキャンペーン 植物観察キット](https://github.com/soracom/handson/blob/master/plant-observation/kit.md)を使って雲のタイムラプスを作成できるように改造
- [Raspberry Pi 2で温湿度・気圧センサのBME280をPythonから使う](http://qiita.com/masato/items/027e5c824ae75ab417c1)を利用できるように修正
- [Raspberry Pi 2 + systemd + udevで、USBデバイス挿入時にサービスを起動する](http://thinkami.hatenablog.com/entry/2015/06/25/064658)を参考にして、AK-020を認識した際に自動的にSORACOM Airに接続されるようにしている

## crontabの例
```
pi@raspberrypi:~ $ crontab -l
* 6-18 * * * python /usr/src/app/send_sensor_data_to_cloud.py &> /dev/null
*/5 6-18 * * * /usr/src/app/take_picture.sh && python /usr/src/app/upload_image.py [/path/to/image.jpg] [S3BucketName] [User-Agent] &> /dev/null
```

## SORACOM Airへの接続/切断
- 自動接続されるので、一時停止したい時用
```bash
pi@raspberrypi:~ $ sudo systemctl stop soracomair.service
pi@raspberrypi:~ $ sudo systemctl start soracomair.service
pi@raspberrypi:~ $ sudo systemctl status soracomair.service
```

## タイムラプス動画出力 on EC2 Ubuntu Server 14.04 LTS
- 参考:[連番静止画からタイムラプス動画を作る](http://qiita.com/riocampos/items/2f4fe927b5cf99aff767)
```bash
sudo apt-get install libav-tools awscli
cd mnt
sudo mkdir [YYYY-MM-DD]
sudo chown ubuntu:ubuntu [YYYY-MM-DD]

aws --region [Region] s3 cp --recursive s3://[S3BucketName]/camera/[IMSI]/[YYYY-MM-DD]/ [YYYY-MM-DD]/
cd [YYYY-MM-DD]/
ls *.jpg | awk '{ printf "mv %s image-%04d.jpg\n", $0, NR }' | sh

avconv -f image2 -r 10 -i image-%04d.jpg -r 10 -an -vcodec libx264 -pix_fmt yuv420p -qscale 0 video.mp4
```
