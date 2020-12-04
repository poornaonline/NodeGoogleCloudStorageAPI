const express = require('express')
const { v4: uuidv4 } = require('uuid');
const GCloudStorage = require("./GCloudStorage")

const app = express()
const port = 3000

const gcs = new GCloudStorage()

app.get('/', (req, res) => {
  res.send({
      message: "Welcome to the API"
  })
})

app.post('/upload', gcs.getMulterInstance().single('file'), (req, res) => {


    try {

        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "No file found"
            });
        }
    
        // Generate Unique ID for the file name
        const uuidx = uuidv4()
    
        // File type validation, At this moment we are uploading images (JPEG, PNG)
        let fileExtension = "png"
    
        if (req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/jpg") {
            fileExtension = "png"
        } else if (req.file.mimetype == "image/png") {
            fileExtension = "jpg"
        } else {
            return res.status(400).send({
                success: false,
                message: "Invalid file type, Please upload PNG or JPEG photo"
            })
        }
    
        const fileName = `${uuidx}.${fileExtension}`
    
        console.log("Generate file name: " + fileName);
    
        const blob = gcs.getBucketInstance().file(`${fileName}`);
    
        const blobStream = blob.createWriteStream();
    
        blobStream.on('error', (err) => {
            if (err) {
                console.log(err)
                return res.status(500).send({
                    success: false,
                    message: "Error ocurred while uploading the photo. Please try again"
                })
            }
        });
    
        blobStream.on('finish', async () => {
    
            const signedUrlResponse = await blob.getSignedUrl({
                action: "read",
                expires: Date.now() + 6000000
            });
    
            console.log("Signed URL " + signedUrlResponse);
    
            res.status(200).send({
                success: true,
                message: "Photo uploaded successfully"
            });
        });
    
        blobStream.end(req.file.buffer);

    } catch (e) {

        console.log(e);

        return res.status(500).send({
            success: false,
            message: "Error occurred while performing the action. Please try again"
        })
    }

})

app.listen(port, () => {
  console.log(`Google Cloud Stoage API app listening at http://localhost:${port}`)
})