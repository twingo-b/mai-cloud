# 参考
- [【新機能】 #SORACOM EndorseによるSIMカードとAWSの認証連携](http://dev.classmethod.jp/cloud/endorse-integrate-auth-with-aws/)

# deploy

```bash
npm install
zip -r upload.zip *
aws -lambda update-function-code --function-name publish_image --zip-file fileb://upload.zip
```
