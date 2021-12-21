const cron = require('node-cron');
const config = require("config");
const store = require('store2');
const downloader = require("./mtgdownloader");
const dwnZipImages = require('./mtgImagesDownloader');
const card = require("./cardscsv")

const execFrequency = config.get("execFrequency");
const imgExecFrequency = config.get("imgExecFrequency");

exports.initCronJobs = async()=>{
    if(execFrequency != "never"){
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

    if(imgExecFrequency != "never"){
        var imgTask = cron.schedule(execFrequency, async()=>{
            var taskRunning = store.get("IMG_TASK_RUNNING");
    
            if(!taskRunning){
                console.log("Executing Scheduled Image task");
                await dwnZipImages.dwnZipImages();
            }
            else{
                console.info("Scheduled image task already running");
            }
        });
    
        imgTask.start();

    }
}