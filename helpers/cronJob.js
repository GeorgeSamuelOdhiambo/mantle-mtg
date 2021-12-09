const cron = require('node-cron');
const config = require("config");
const store = require('store2');
const downloader = require("./mtgdownloader");
const card = require("./cardscsv")

const execFrequency = config.get("execFrequency");

exports.initCronJobs = async()=>{
    var task = cron.schedule(execFrequency, async()=>{
        var taskRunning = store.get("TASK_RUNNING");

        if(!taskRunning){
            console.log("Executing Scheduled task");
            await downloader.dwnExtract();
        }
        else{
            console.info("Scheduled task already running");
        }
    });

    task.start();
}