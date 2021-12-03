const request = require("superagent");
const fs = require("fs");
const extract = require('extract-zip')
const config = require('config');
const {resolve} = require("path");

const href = config.get('zip.link');
const zipFile = config.get('zip.zipPath');
const outputDir = config.get('zip.extractPath');

exports.dwnExtract = async() => {
  request
    .get(href)
    .on("error", function (error) {
      console.log(error);
    })
    .pipe(fs.createWriteStream(zipFile))
    .on("finish",async () => {
      console.log("finish");
      await extractFiles();
    });
};

extractFiles = async() => {
    try {
        await extract(resolve(zipFile), { dir: resolve(outputDir) })
        console.info("complete extraction");
    } catch (error) {
        console.error(error);
    }
};
