const fs = require("fs");
const config = require("config");
const {
    resolve,
    join
} = require("path");
const store = require('store2');
const ciqlJSON = require('ciql-json');
const dwnZipImages = require('../helpers/mtgImagesDownloader');
let configFilePath = resolve( join("config","default.json"));

exports.getStatus = async(req, res)=>{
    res.send({
        status:store.get("IMG_TASK_RUNNING"), 
        execFrequency:config.get("imgExecFrequency"),
        limitRecords:config.get("imgLimitRecords"),
        recordCount:store.get("IMG_PROCESSING_COUNT")
        /*processType:config.get("processType") */
    })
}

exports.startTask = async(req, res)=>{
    var taskRunning = store.get("IMG_TASK_RUNNING");

    if(!taskRunning){

        await dwnZipImages.dwnZipImages();

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

exports.updateConfig = async(req, res)=>{
    const data = req.body

    ciqlJSON.open(configFilePath)
        .set("imgExecFrequency",data.execFrequency)
        .set("imgLimitRecords",data.limitRecords)
        //.set("processType",data.processType)
        .save()

    res.send({
        status:"successful"
    })
}
