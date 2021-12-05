const request = require("superagent");
const fs = require("fs");
const extract = require('extract-zip')
const config = require('config');
const {
  resolve,
  join
} = require("path");
var http = require('http');
var https = require('https');
const db = require("../models/db");
const cardscsv = require("./cardscsv")

const href = config.get('zip.link');
const zipFile = config.get('zip.zipPath');
const tcgSkuPath = config.get('zip.tcgSkuPath');
const outputDir = config.get('zip.extractPath');
const urlTcgSkus = "https://mtgjson.com/api/v5/TcgplayerSkus.json.zip";

exports.dwnExtract = async () => {
  var dt = new Date();

  console.info("Downloads and Extracts started at " + dt.toISOString())

  await request
    .get(href)
    .on("error", function (error) {
      console.log(error);
    })
    .pipe(fs.createWriteStream(zipFile))
    .on("finish", async () => {
      console.info("Downloading .zip files completed");
      await extractFiles(zipFile, outputDir);
      await downloadTcgPlayerSkus();
      await downloadMantleMTGRecords();
      console.info("Downloads Completed");

      dt = new Date();

      console.info("Downloads and Extracts completed at " + dt.toISOString())

      cardscsv.readCardsFiles();
    });
};

extractFiles = async (zipFilePath, outputDirPath) => {
  try {
    await extract(resolve(zipFilePath), {
      dir: resolve(outputDirPath)
    })
    console.info("complete extraction");
  } catch (error) {
    console.error(error);
  }
};

downloadTcgPlayerSkus = async () => {
  request
    .get(urlTcgSkus)
    .on("error", function (error) {
      console.log(error);
    })
    .pipe(fs.createWriteStream(tcgSkuPath))
    .on("finish", async () => {
      console.info("Downloading SKU .zip files completed");
      await extractFiles(tcgSkuPath, outputDir);
    });
}

downloadMantleMTGRecords = async () => {
  console.info("Fetching all MantleMTG database");
  try {
    const mtgRecords = await db.sequelize.query(`SELECT json_agg(t) as "result" FROM "MantleMTG" t`, {
      plain: true,
      raw: true,
      logging: false
    })
    await fs.writeFileSync(resolve(join(outputDir, 'mantle_mtg_db.json')), JSON.stringify(mtgRecords.result));

    console.info("Fetching all MantleMTG completed");

  } catch (error) {
    console.error(error)
  }
}