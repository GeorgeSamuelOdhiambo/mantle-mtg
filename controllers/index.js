const fs = require("fs");
const config = require("config");
const {
    resolve,
    join
} = require("path");
const store = require('store2');
const ciqlJSON = require('ciql-json');
const fileUpload = require("../helpers/fileUpload");
const sqlGen = require("../helpers/sqlGenerator")
const pricing = require("../helpers/pricingUpdates")
const downloader = require("../helpers/mtgdownloader");
const resultCsvPath = `${config.get("zip.resultCsvPath")}`;
const passCode = config.get("passCode");
let configFilePath = resolve(".\\config\\default.json");
const docResultsJson = resolve(config.get("zip.docResultsJson"));


exports.getFiles = async (req, res) => {
    let documentData = fs.readFileSync(docResultsJson,{encoding:"utf8"});

    let docs = JSON.parse(documentData);

    fs.readdir(resolve(resultCsvPath), function (err, files) {
        if (err) {
            res.status(500).send({
                message: "Unable to scan files!",
            });
            return;
        }
        var fileInfos = [];

        if(files){
            files.forEach((file) => {
                const doc = docs["documents"].find(x => x.filename == file)
                fileInfos.push({
                    name: file,
                    recordsCount:doc["recordCount"],
                    dateTime:doc["time"],
                    url: req.protocol + "://" + req.headers.host + "/" + "file/" + file,
                });
            });
        }
        res.status(200).send(fileInfos);
    })
}

exports.downloadFile = async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = resolve(join(resultCsvPath, fileName));
    res.download(filePath, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            })
        }
    })
}

exports.uploadMagicFile = async (req, res) => {
    req.setTimeout(900000, function () {
        // call back function is called when request timed out.
    });

    if (req.body.passCode != passCode.toString()) {
        res.status(201).send({
            message: "Invalid Authorization Code"
        });
        return
    }
    try {
        const fileName = req.files.file.name;

        await fileUpload.fileUpload(req)

        await sqlGen.generateMtgSql(fileName).then(sqlFilePath => {

            res.download(resolve(sqlFilePath), (err) => {
                if (err) {
                    res.status(500).send({
                        message: "Could not download the file. " + err,
                    })
                }
            })
        });

    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file:. ${err}`,
        });
    }

}

exports.uploadTCGPricingFile = async (req, res) => {
    req.setTimeout(900000, function () {
        // call back function is called when request timed out.
    });

    if (req.body.passCode != passCode.toString()) {
        res.status(201).send({
            message: "Invalid Authorization Code"
        });
        return
    }
    try {
        const fileName = req.files.file.name;

        await fileUpload.fileUpload(req)

        await pricing.updateMantlePrices(fileName).then(response => {
            res.status(200).send(response)
        }).catch(err=>{
            res.status(500).send(err)
        });
        
    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file:. ${err}`,
        });
    }
}

exports.getStatus = async(req, res)=>{
    res.send({
        status:store.get("TASK_RUNNING"),
        execFrequency:config.get("execFrequency"),
        limitRecords:config.get("limitRecords"),
        processType:config.get("processType")
    })
}

exports.updateConfig = async(req, res)=>{
    const data = req.body

    ciqlJSON.open(configFilePath)
        .set("execFrequency",data.execFrequency)
        .set("limitRecords",data.limitRecords)
        .set("processType",data.processType)
        .save()

    res.send({
        status:"oka"
    })
}

exports.startTask = async(req, res)=>{
    var taskRunning = store.get("TASK_RUNNING");

    if(!taskRunning){
        
        downloader.dwnExtract();

        res.send({
            message:"Task Scheduled"
        })
    }
    else{
        res.status(500).send({
            error:"Task Already running"
        })
    }
}