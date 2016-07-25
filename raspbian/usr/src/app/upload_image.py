#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import requests
import json
import jwt
import time

if len(sys.argv) < 4:
    print "usage: python upload_image.py [/path/to/image.jpg] [S3BucketName] [User-Agent]"
    sys.exit(1)

# 引数から画像ファイルをオープン
image = open(sys.argv[1], 'rb')
# Endorse Tokenの取得
print "- SORACOM Endorse にアクセスして token を取得中 ..."
response=json.loads(requests.get('https://endorse.soracom.io/').text)
token = response['token']
print token
decoded = jwt.decode(token, verify = False)
print json.dumps(decoded, indent=4)

# 画像のアップロード
base_url = "https://%s.s3.amazonaws.com/incoming/camera/" % sys.argv[2]
print "- Amazon S3 にファイルをアップロード中 ..."
print "PUT %s" % base_url+decoded['jti']
r = requests.put(base_url+decoded['jti'], data=image, headers={'user-agent': sys.argv[3], 'x-amz-acl': 'bucket-owner-full-control','x-amz-meta-jwt':token, 'content-type': 'image/jpg'})
print "status: %s" % r.status_code
