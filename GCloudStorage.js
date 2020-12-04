const Multer = require("multer")
const GoogleCloudStorage = require("@google-cloud/storage")

const path = require('path')
const serviceKey = path.join(__dirname, './serviceKey.json')

class GCloudStorage {

    bucketName = "idrivebackend.appspot.com"

    getStorageInstance() {
        return new GoogleCloudStorage.Storage({
            keyFilename : serviceKey
        });
    }

    getMulterInstance() {
        return Multer({
            storage: Multer.memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024, // 10 MB Max file size
            }
        })
    }

    getBucketInstance() {
        let storageInstance = this.getStorageInstance()
        return storageInstance.bucket(this.bucketName)
    }

}

module.exports = GCloudStorage