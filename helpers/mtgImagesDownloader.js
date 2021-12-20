const csv = require("csv-parser");
const fs = require("fs");
const config = require("config");
const request = require("superagent");
const db = require("../models/db");
const {
  Op
} = require("sequelize");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const {
  resolve, join
} = require("path");
const util = require('util');
const fse = require('fs-extra');
const ciqlJSON = require('ciql-json');
const store = require('store2');
const AdmZip = require('adm-zip');
const glob = require('glob');
const cardsPath = join(`${config.get("zip.extractPath")}`,'cards.csv');
const imageIdsPath = resolve(config.get("images.mtg.imageIds"));
const downloadPath = config.get("images.mtg.downloadPath");
const imageResultsPath = resolve(config.get("images.mtg.imageResults"));
const imageZipPath = resolve(config.get("images.mtg.zipPath"));
var downLoadedImages = [];
var multiverseIds = [];
var newMultiverseIds = [];
var execTime = 0;
//incase processing will be limited to specific no#
var _newMultiverseIds = [];
var allProcessedId = []

exports.dwnZipImages = async()=>{
    await getExistingImageIds();
    await getCardMultiverseIds();

    //filter out not downloaded multiverseIds
    newMultiverseIds = multiverseIds.filter((id) => {
        return !new Set(downLoadedImages).has(id);
    });

    await processRecords();

}

const getExistingImageIds = ()=> new Promise(async(resolved, reject)=>{
    try {
        let imgIds = fs.readFileSync(imageIdsPath,{encoding:"utf8"});
        const data = JSON.parse(imgIds);
        downLoadedImages = data['multiverse_ids'];
        resolved()
    } catch (error) {
        reject()
    }
});

const getCardMultiverseIds = ()=> new Promise(async(resolved, reject)=>{
    await fs.createReadStream(resolve(cardsPath))
        .on("error", (error) => {
            reject()
        })
        .pipe(csv())
        .on("data", (row) => {
            if(row["multiverseId"] !== '' && row["multiverseId"] !== null && row["multiverseId"] !== undefined){
                if(!multiverseIds.includes(row["multiverseId"])){
                    multiverseIds.push(row["multiverseId"])
                }
            }
        })
        .on("end", async () => {
            console.info("CSV Data Loading end");
            resolved()
        });
});

const processRecords = async () => {
    newMultiverseIds = newMultiverseIds.splice(0,0);
    allProcessedId = downLoadedImages.concat(newMultiverseIds);
    _newMultiverseIds = JSON.parse(JSON.stringify(newMultiverseIds));

    while (newMultiverseIds.length) {
        var start = new Date();
        await Promise.all(newMultiverseIds.splice(0, 100).map(downLoadImage));
        var finish = new Date();
        execTime = execTime+(Math.abs(finish - start)/1000)
    }
    console.info("Images Downloads completed "+execTime.toString())
    await updateDBImageUrl();

    await updateImageIds();

    //await archiveImages();
}

const downLoadImage = (multiverse_id) => new Promise(async(resolved, reject)=>{
    request
        .get(`https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${multiverse_id}&type=card`)
        .on("error", function (error) {
            console.log(error);
            reject()
        })
        .pipe(fs.createWriteStream(resolve(downloadPath,`${multiverse_id}.jpeg`)))
        .on("finish", async () => {
            console.info(`Downloading image ${multiverse_id} completed`);
            resolved()
        });
});

const updateImageIds = () => new Promise(async(resolved, reject)=>{
    try {
        ciqlJSON.open(imageIdsPath)
            .set("multiverse_ids",allProcessedId)
            .save()
        
        console.info("Images json updated")
        resolved()
    } catch (error) {
        console.error(error)
        reject()
    }
});

const updateDBImageUrl = ()=> new Promise(async(resolved, reject)=>{
    try {
        if(_newMultiverseIds.length > 0){

            await db.MantleMTG.update({
                'Image': db.Sequelize.fn('CONCAT','./assets/img/cards/mtg/',db.Sequelize.col('multiverseId'),'.jpeg'),
                date_updated: new Date(new Date().toUTCString())
            },{
                where:{
                    multiverseId: {
                        [Op.in]: _newMultiverseIds
                    }
                },
                logging:false
            })
        }
        console.info("Main database updated")
        resolved()
    } catch (error) {
        console.error(error)
        reject()
    }
});

const archiveImages = ()=> new Promise(async(resolved, reject)=>{
    try {
        console.log(resolve(downloadPath))
        glob(resolve(downloadPath) + '/**/*.jpeg', {}, (err, files)=>{
            console.log(files.length);
            files.forEach(file => {
                adminZip.addLocalFile(file);
            });
    
            if(files.length > 0){
                fs.writeFileSync(resolve(join(imageZipPath,'output.zip')), adminZip.toBuffer());
            }
            console.log("Images compression completed");
            resolved()
        })
        
    } catch (error) {
        console.error(error);
        reject()
    }
    const adminZip = new AdmZip();
});
