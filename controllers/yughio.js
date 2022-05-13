const fs = require("fs");
const config = require("config");
const {
    resolve,
    join
} = require("path");
const store = require('store2');
const fileUpload = require("../helpers/fileUpload");
const yughioHelper = require("../helpers/yughioHelper")
const ygoImageDownloader = require('../helpers/ygoImagesDownloader')
const imageIdsPath = resolve(config.get("images.ygo.imageIds"));


exports.uploadYughioFile = async (req, res) => {
    req.setTimeout(1800000, function () {
        // call back function is called when request timed out.
    });

    try {
        const fileName = req.files.file.name;
        const img = req.body.downloadImages;
        console.log(fileName)
        console.log(img)

        await fileUpload.fileUpload(req, true);

        await yughioHelper.populateRecords(fileName, img).then((outFilePath)=>{
            res.download(resolve(outFilePath), (err)=>{
                if (err) {
                    res.status(500).send({
                        message: "Could not download the file. " + err,
                    })
                }
            })
        })


    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file:. ${err}`,
        });
    }

}

exports.startTImageTask = async(req, res) =>{
    var taskRunning = store.get("IMG_TASK_RUNNING");

    if(!taskRunning){
        let imgIds = fs.readFileSync(imageIdsPath, { encoding: "utf8" });
        const data = JSON.parse(imgIds);
        if(data['short_codes'].length > 0){
            await ygoImageDownloader.dwnZipImages()

            res.send({
                message:"Task Scheduled"
            })
        }
        else{
            res.status(500).send({
                error:"No uploaded Yugioh data was found, upload the CVS before processing the images"
            })
        }
    }
    else{
        res.status(500).send({
            error:"Another Image downloading Task Already running"
        })
    }
}