const csv = require("csv-parser");
const fs = require("fs");
const config = require("config");
const request = require("superagent");
const db = require("../models/db");
const {
    Op
} = require("sequelize");
const {
    resolve, join
} = require("path");
const util = require('util');
const fse = require('fs-extra');
const ciqlJSON = require('ciql-json');
const store = require('store2');
const AdmZip = require('adm-zip');
const glob = require('glob');
const { exec } = require('child_process');
const mtgDownloader = require('./mtgImagesDownloader')
const cardsPath = join(`${config.get("zip.extractPath")}`, 'cards.csv');
const imageIdsPath = resolve(config.get("images.ygo.imageIds"));
const downloadPath = config.get("images.ygo.downloadPath");
const imageResultsPath = resolve(config.get("images.mtg.imageResults"));
const imageZipPath = resolve(config.get("images.mtg.zipPath"));
const bashZip = resolve(config.get("images.mtg.bashZip"));
const limitImages = parseInt(config.get("imgLimitRecords"));
var downLoadedImages = [];
var execTime = 0;
var allProcessedId = []
var shortCodesId = []

exports.dwnZipImages = async () => {
    store.set("IMG_TASK_RUNNING", true);
    try {


        let imgIds = fs.readFileSync(imageIdsPath, { encoding: "utf8" });
        const data = JSON.parse(imgIds);
        shortCodesId = data['short_codes'];

        await processRecords();
    } catch (error) {
        console.error(error)
    }
    
    store.set("IMG_TASK_RUNNING", false);

}

const processRecords = async () => {

    if (!fs.existsSync(resolve(downloadPath))) {
        fs.mkdirSync(resolve(downloadPath), { recursive: true });
    }

    var total = shortCodesId.length;

    while (shortCodesId.length) {
        store.set("IMG_PROCESSING_COUNT", `remaining ${shortCodesId.length} of ${total}`);

        var start = new Date();
        await Promise.all(shortCodesId.splice(0, 100).map(downLoadImage));
        var finish = new Date();
        execTime = execTime + (Math.abs(finish - start) / 1000)
    }
    console.info("Yugioh Images Downloads completed " + execTime.toString())
    //await updateDBImageUrl();

    //await updateImageIds();

    await mtgDownloader.archiveImages()
}

const downLoadImage = (shortCode) => new Promise(async (resolved, reject) => {
    try {

        if (!fs.existsSync(resolve(downloadPath, `${shortCode}.jpg`))) {
            request
                .get(`h ttps://static-3.studiobebop.net/ygo_data/card_variants/${shortCode}.jpg`)
                .on("error", function (error) {
                    console.log(error, shortCode);
                    reject()
                })
                .pipe(fs.createWriteStream(resolve(downloadPath, `${shortCode}.jpg`)))
                .on("finish", async () => {
                    console.info(`Downloading image ${shortCode} completed`);
                    resolved()
                });
        }
        else {
            console.info(`${shortCode}.jpg already exists`)
            resolved()
        }

    } catch (error) {
        console.error(error)
        reject()
    }
});