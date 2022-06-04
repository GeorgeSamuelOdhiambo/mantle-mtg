const fs = require("fs");
const config = require("config");
const {
    resolve,
    join
} = require("path");
const store = require('store2');
const ciqlJSON = require('ciql-json');
const pkmnDownloader = require('../helpers/pkmnDownloader');
let configFilePath = resolve( join("config","default.json"));

exports.getStatus = async(req, res)=>{
    res.send({
        status:store.get("PKMN_TASK_RUNNING")
    })
}

exports.startTask = async(req, res)=>{
    var taskRunning = store.get("PKMN_TASK_RUNNING");

    if(!taskRunning){
        store.set("PKMN_TASK_RUNNING", true);

        await pkmnDownloader.dwnExtract();

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