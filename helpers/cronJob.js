const cron = require('node-cron');
const config = require("config");
const downloader = require("./mtgdownloader");

const execFrequency = config.get("execFrequency");

exports.initCronJobs = async()=>{
    var task = cron.schedule(execFrequency, async()=>{
        console.log("Executing Scheduled task");
        await downloader.dwnExtract();
    });

    task.start();
}