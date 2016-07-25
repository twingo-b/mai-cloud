#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import re
from bme280 import *

# IMSIの取得
import requests
import json

print "- メタデータサービスにアクセスして IMSI を確認中 ...",
subscriber=json.loads(requests.get('http://metadata.soracom.io/v1/subscriber').text)
imsi = subscriber['imsi']
print imsi

# Beam 経由で Elasticsearch Service に接続
import time
import datetime
from elasticsearch import Elasticsearch
es = Elasticsearch('beam.soracom.io:18080')

# bmp280から読み取り、Elasticserch Service にデータを送信
result = readData()
print "- ただいまの温度 %-6.2f (c)" % result.temp
print "- ただいまの気圧 %6.2f hPa" % result.pres
print "- ただいまの湿度 %7.2f %%" % result.hum
print "- Beam 経由でデータを送信します"
print es.index(index="sensor-%s" % datetime.datetime.utcnow().strftime('%Y-%m-%d'), doc_type="bme280", body={"imsi":imsi, "temp":result.temp, "pres":result.pres, "hum":result.hum, "timestamp":datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')})
