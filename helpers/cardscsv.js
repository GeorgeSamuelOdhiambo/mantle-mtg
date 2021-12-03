const csv = require("csv-parser");
const fs = require("fs");
const config = require("config");
const db = require("../models/db");
const {
  Op
} = require("sequelize");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const {
  resolve
} = require("path");
const util = require('util');
const fse = require('fs-extra')


const cardsPath = `${config.get("zip.extractPath")}\\cards.csv`;
const setsPath = `${config.get("zip.extractPath")}\\sets.csv`;
const rulingsPath = `${config.get("zip.extractPath")}\\rulings.csv`;
const resultCsvPath = `${config.get("zip.resultCsvPath")}`;
const resultCsvPathArch = `${config.get("zip.resultCsvPathArch")}`;
const CSV_PATH = util.format('%s%s.%s', resultCsvPath, new Date().toISOString().substr(0, 19).split('T').join('').split('-').join('').split(':').join(''), 'csv')

var dataResult = [];
var csvInitData = [];
var csvSetsData = [];
var csvRulingsData = [];

exports.readCardsFiles = async() => {
  
  await loadSetData();
  await loadRulingsData();

  fs.createReadStream(resolve(cardsPath))
    .on("error", (error) => {
      console.error(error);
    })

    .pipe(csv())
    .on("data", (row) => {
      csvInitData.push(row);
    })

    .on("end", async () => {
      await processRecords();
      console.info("CSV Data Processing end");
    });
};

//Load Sets.csv
const loadSetData = async()=>{
 await  fs.createReadStream(resolve(setsPath))
  .on("error", (error) => {
    console.error(error);
  })

  .pipe(csv())
  .on("data", (row) => {
    csvSetsData.push(row);
  })
  .on("end", async () => {
    console.info("Sets Data Loading Completed");
  });
}

//Load rulings.csv

const loadRulingsData = async()=>{
  await  fs.createReadStream(resolve(rulingsPath))
   .on("error", (error) => {
     console.error(error);
   })
 
   .pipe(csv())
   .on("data", (row) => {
     csvRulingsData.push(row);
   })
   .on("end", async () => {
     console.info("Rulings Data Loading Completed");
   });
 }

//https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/

const processRecords = async () => {
  // map array to promises
  const promises = csvInitData.map(processRecord);
  // wait until all promises are resolved
  await Promise.all(promises);

  console.log('Done!');

  await generateResultCSv();

}

const processRecord = async (record) => {

  const childSKU = record["tcgplayerProductId"];

  if (childSKU != undefined) {
    const cardData = await getMTGCardById(childSKU);
    
    if (cardData != null) {
      await compareRecords(record, cardData);
    }
  }
}

const getMTGCardById = async (childSKU) => {
  return await db.MantleMTG.findOne({
    where: {
      "Child Sku": childSKU,
    },
    raw: true,
    logging: false,
  });
}

const compareRecords = async (csvRecord, mantleRecord) => {
  var recordDif = {};

  const setData = csvSetsData.find(x=> x["code"] == csvRecord["setCode"]);
  const rulingData = csvRulingsData.find(x=> x["uuid"] == csvRecord["uuid"]);

  console.log(rulingData)

  //Parent SKU
  if (csvRecord["mtgoId"] && csvRecord["mtgoId"].trim().length) {
    if (csvRecord["mtgoId"] != mantleRecord["Parent Sku"]) {
      recordDif["Parent Sku"] = csvRecord["mtgoId"];
    }
  }

  if (Object.keys(recordDif).length != 0) {
    recordDif["Status"] = "Updated";
    recordDif["Child Sku"] = csvRecord["tcgplayerProductId"]
    dataResult.push(recordDif)
  }

};

const newRecords = async (csvRecord) => {
  const setData = csvSetsData.find(x=> x["code"] == csvRecord["setCode"]);

}

const generateResultCSv = async () => {

  console.info("Generating Results CSV Data")
  console.log(dataResult)
  console.log(resolve(CSV_PATH))

  if (dataResult.length > 0) {
    
    await fse.ensureDirSync(resolve(resultCsvPath));

    await fse.move(resolve(resultCsvPath), resolve(resultCsvPathArch), { overwrite: true })
      .then(() => {
        console.log('Old Results Moved to Arch!')
      })
      .catch(err => {
        console.error(err)
      });

    await fse.ensureDirSync(resolve(resultCsvPath));

    var columns = [{
        id: "Status",
        title: "Status"
      },
      {
        id: "Child Sku",
        title: "Child Sku"
      },
      {
        id: "Mantle SKU",
        title: "Mantle SKU"
      },
      {
        id: "Parent Sku",
        title: "Parent Sku"
      },
      {
        id: "Product Type",
        title: "Product Type"
      },
      {
        id: "Product Line",
        title: "Product Line"
      },
      {
        id: "Category",
        title: "Category"
      },
      {
        id: "Parent Product Name",
        title: "Parent Product Name"
      },
      {
        id: "Product Name",
        title: "Product Name"
      },
      {
        id: "Condition",
        title: "Condition"
      },
      {
        id: "Language",
        title: "Language"
      },
      {
        id: "Description",
        title: "Description"
      },
      {
        id: "Sale Price",
        title: "Sale Price"
      },
      {
        id: "Average Cost",
        title: "Average Cost"
      },
      {
        id: "Quantity on Hand",
        title: "Quantity on Hand"
      },
      {
        id: "Reorder Point",
        title: "Reorder Point"
      },
      {
        id: "Reserve Quantity",
        title: "Reserve Quantity"
      },
      {
        id: "Picking Bin",
        title: "Picking Bin"
      },
      {
        id: "Manufacturer SKU",
        title: "Manufacturer SKU"
      },
      {
        id: "SKU",
        title: "SKU"
      },
      {
        id: "UPC",
        title: "UPC"
      },
      {
        id: "ALU",
        title: "ALU"
      },
      {
        id: "ASIN",
        title: "ASIN"
      },
      {
        id: "Mantle Resources",
        title: "Mantle Resources"
      },
      {
        id: "Comments",
        title: "Comments"
      },
      {
        id: "Release Date",
        title: "Release Date"
      },
      {
        id: "Weight",
        title: "Weight"
      },
      {
        id: "Height",
        title: "Height"
      },
      {
        id: "Length",
        title: "Length"
      },
      {
        id: "Width",
        title: "Width"
      },
      {
        id: "Short Code",
        title: "Short Code"
      },
      {
        id: "Set Name",
        title: "Set Name"
      },
      {
        id: "Rarity",
        title: "Rarity"
      },
      {
        id: "Mana Cost",
        title: "Mana Cost"
      },
      {
        id: "Color",
        title: "Color"
      },
      {
        id: "Card Type",
        title: "Card Type"
      },
      {
        id: "Rules Text",
        title: "Rules Text"
      },
      {
        id: "Power",
        title: "Power"
      },
      {
        id: "Toughness",
        title: "Toughness"
      },
      {
        id: "Flavor Text",
        title: "Flavor Text"
      },
      {
        id: "Artist",
        title: "Artist"
      },
      {
        id: "Card Number",
        title: "Card Number"
      },
      {
        id: "TCG Low Price",
        title: "TCG Low Price"
      },
      {
        id: "TCG Direct Low",
        title: "TCG Direct Low"
      },
      {
        id: "TCG Market Price",
        title: "TCG Market Price"
      },
      {
        id: "TCG Price Date",
        title: "TCG Price Date"
      },
      {
        id: "Buylist Price",
        title: "Buylist Price"
      }
    ]

    const csvWriter = createCsvWriter({
      path: resolve(CSV_PATH),
      header: columns
    });

    await csvWriter.writeRecords(dataResult).then(() => {
      console.log("Write to " + CSV_PATH + " successfully!")
    })

  }
}