# mai-cloud

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
