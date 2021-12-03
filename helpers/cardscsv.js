const csv = require("csv-parser");
const fs = require("fs");
const config = require("config");
const db = require("../models/db");
const { Op } = require("sequelize");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const filePath = `${config.get("zip.extractPath")}\\card.csv`;

var dataResult = [];

exports.readCardsFiles = () => {
  fs.createReadStream(filePath)
    .on("error", (error) => {
      console.error(error);
    })

    .pipe(csv())
    .on("data", async(row) => {
      await processRecodes(row);
    })

    .on("end", () => {
      console.info("the end");

    });
};

processRecodes = async (record) => {
  const chieldSKU = record.tcgplayerProductId;

  if (chieldSKU != undefined) {
    const cardData = await getMTGCardById(chieldSKU);
    console.log(cardData);
    if (cardData != null) {
      await compareRecords(record,cardData);
    }
  }
};

const getMTGCardById = async (chieldSKU) => {
  return await db.MantleMTG.findOne({
    where: {
      "Child Sku": chieldSKU,
    },
    raw: true,
    logging: false,
  });
};

const compareRecords = async (CSVrecord, MantleRecode) => {
  var recordDif = {};

  //Parent SKU
  if (CSVrecord.mtgold != MantleRecode["Parent Sku"]) {
    recordDif["Parent Sku"] = CSVrecord.mtgold;
  }
  if (Object.keys(recordDif).length != 0) {
    recordDif["Status"] = "Updated";
    dataResult.push(recordDif)
  }

};

const newRecords = async (CSVrecord) =>{
  
}


const genarateResultCSv = async () =>{
  if(dataResult.length > 0){
    var columns = []
    result.fields.forEach(column => {
        columns.push({
          id: column["name"], title: column["name"]
        })
    });
    
    const csvWriter = createCsvWriter({
        path: CSV_PATH,
        header: columns
    });

    await csvWriter.writeRecords( ).then(()=>{
        console.log("Write to "+CSV_PATH+" successfully!")
    })


  }
}
