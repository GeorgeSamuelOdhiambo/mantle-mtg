const csv = require("csv-parser");
const fs = require("fs");
const config = require("config");
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
const axios = require('axios');
const store = require('store2');
const ciqlJSON = require('ciql-json');

const cardsPath = join(`${config.get("zip.extractPath")}`,'cards.csv');
const setsPath = join(`${config.get("zip.extractPath")}`,'sets.csv');
const rulingsPath = join(`${config.get("zip.extractPath")}`,'rulings.csv');
const tcgPlayerSkusPath = join(`${config.get("zip.extractPath")}`,'TcgplayerSkus.json');
const resultCsvPath = `${config.get("zip.resultCsvPath")}`;
const resultCsvPathArch = `${config.get("zip.resultCsvPathArch")}`;
const outputDir = config.get('zip.extractPath');
const limitRecords = parseInt(config.get('limitRecords'));
const processType = config.get('processType');
const docResultsJson = resolve(config.get("zip.docResultsJson"));
var filename = "";
var CSV_PATH = "";
const columns = [{
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

var csvWriter = {}

var dataResult = [];
var csvInitData = [];
var csvSetsData = [];
var csvRulingsData = [];
var tcgPlayerSku = {};
var mantleMtgDBRecords = []
var rCount = 0;
var execTime = 0;

exports.readCardsFiles = async () => {
  csvInitData = [];
  await loadSetData();
  await loadRulingsData();
  await loadTcgPlayerSku();
  await loadMantleMTGData();
  await createResultsCsv();
  await initCsvWriter();
  await fs.createReadStream(resolve(cardsPath))
    .on("error", (error) => {
      console.error(error);
      store.set("TASK_RUNNING", false);
    })

    .pipe(csv())
    .on("data", (row) => {
      csvInitData.push(row);
    })

    .on("end", async () => {
      await processRecords();
      store.set("TASK_RUNNING", false);
      console.info("CSV Data Processing end");
    });
};

/**
 * 
 * @returns Initialize cqv record with headers
 */
const initCsvWriter = ()=> new Promise(async(resolved, reject)=>{

  try {
    filename = util.format('%s.%s', new Date().toISOString().substr(0, 19).split('T').join('').split('-').join('').split(':').join(''), 'csv')
    CSV_PATH = util.format('%s%s', resultCsvPath,filename);
    csvWriter = createCsvWriter({
      path: resolve(CSV_PATH),
      header: columns,
      alwaysQuote:true,
      //append:true
    });
  
    csvWriter.writeRecords([]).then(()=>{
      //Once 1st record is created, now allow append
      csvWriter = createCsvWriter({
        path: resolve(CSV_PATH),
        header: columns,
        alwaysQuote:true,
        append:true
      });
      resolved()
    })
    
  } catch (err) {
    console.error(err);
    throw new Error(err)
  }

});

//Load Sets.csv
const loadSetData = () => new Promise(async(resolved, reject)=>{
  await fs.createReadStream(resolve(setsPath))
    .on("error", (error) => {
      console.error(error);
      reject()
    })

    .pipe(csv())
    .on("data", (row) => {
      csvSetsData.push(row);
    })
    .on("end", async () => {
      console.info("Sets Data Loading Completed");
      resolved()
    });
});

//Load rulings.csv

const loadRulingsData = () => new Promise(async(resolved, reject)=>{
  await fs.createReadStream(resolve(rulingsPath))
    .on("error", (error) => {
      console.error(error);
      reject()
    })

    .pipe(csv())
    .on("data", (row) => {
      csvRulingsData.push(row);
    })
    .on("end", async () => {
      console.info("Rulings Data Loading Completed");
      resolved()
    });

});

//Load TCG Player SKu
const loadTcgPlayerSku = () => new Promise(async(resolved, reject)=>{

  console.info("Loading TcgPlayerSku")
  let tcgSkudata = fs.readFileSync(resolve(tcgPlayerSkusPath), {
    encoding: "utf8"
  });

  tcgPlayerSku = JSON.parse(tcgSkudata);
  console.info("Loading TcgPlayerSku Completed")

  resolved()
}); 

//Load downloaded MantleMTC table from main db
const loadMantleMTGData = ()=> new Promise(async(resolved, reject)=>{
  console.info("Loading MTG mantle data")
  let jsonData = await fs.readFileSync(resolve(join(outputDir,'mantle_mtg_db.json')),{encoding:"utf8"});

  mantleMtgDBRecords = JSON.parse(jsonData);
  console.info("MTG mantle data completed")
  resolved()
});

//https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/

const processRecords = async () => {

  var dt = new Date();
  rCount = 0;
  console.info("Processing started at " + dt.toISOString())
  if(limitRecords > 0){
    csvInitData = csvInitData.splice(0, limitRecords)
  }

  while (csvInitData.length) {
    var start = new Date();
    await Promise.all(csvInitData.splice(0, 100).map(processStage));
    var finish = new Date();
    execTime = execTime+(Math.abs(finish - start)/1000)
  }

  dt = new Date();
  console.info("Processing ended at " + dt.toISOString());
  console.info("Number Of Records Processed");
  console.info(rCount);
  console.info("Total Execution Time in secs");
  console.info(execTime);

  ciqlJSON.open(docResultsJson)
        .pushTo("documents", {
          filename: filename,
          recordCount:rCount,
          time:dt.toISOString()
        })
        .save()

  //await generateResultCSv();

}

const getCardVariants = async (csvRecord) => {
  var cardVariants = []
  const tcgSkuData = tcgPlayerSku.data[csvRecord["uuid"]];

  if (tcgSkuData) {

    tcgSkuData.filter(x => x.language.toLowerCase() == "english").forEach(tcgSku => {
      cardVariants.push({
        ...csvRecord,
        ...{
          childSKU: tcgSku["skuId"],
          parentSKU: tcgSku["productId"],
          condition: tcgSku["condition"],
          language: tcgSku["language"]
        }
      });

    });
  }

  return cardVariants;
}

const processStage = async (record) => {
  const cardData = await getCardVariants(record);
  //console.log(cardData.length)

  const setData = csvSetsData.find(x => x["code"] == record["setCode"]);
  const rulingData = csvRulingsData.find(x => x["uuid"] == record["uuid"]);

  const promises = cardData.map(x => processRecord(x, setData, rulingData));
  await Promise.all(promises);
}

const processRecord = async (record, setData, rulingData) => {

  const childSKU = record["childSKU"].toString();
  //console.log(childSKU)
  if (childSKU != undefined && childSKU.trim().length) {
    const cardData = await getMTGCardById(childSKU);

    if (cardData != null && (processType == 'all' || processType == 'updated')) {
      await compareRecords(record, cardData, setData, rulingData);
    } else {
      if(processType == 'all' || processType == 'new'){
        await newRecords(record, setData, rulingData)
      }
    }
  }
}

const getMTGCardById = async (childSKU) => {
  try {
    /*return await db.MantleMTG.findOne({
      where: {
        "Child Sku": parseInt(childSKU),
      },
      raw: true,
      logging: false,
    });*/

    return mantleMtgDBRecords.find(x => x["Child Sku"] == parseInt(childSKU));

  } catch (error) {
    console.error(error)
  }
  return null
}

const compareRecords = async (csvRecord, mantleRecord, setData, rulingData) => {
  var recordDiff = {};
  var parentProductName = csvRecord["name"];
  var condition = csvRecord["condition"];
  var language = csvRecord["language"];

  if (setData) {
    const setName = setData["name"];
    const releaseDate = setData["releaseDate"];
    //Set Name
    recordDiff["Set Name"] = await getRecordsDiff("", "Set Name", csvRecord, mantleRecord, setName);

    //Release Date
    recordDiff["Release Date"] = await getRecordsDiff("", "Release Date", csvRecord, mantleRecord, releaseDate);

  }

  //Parent SKU
  recordDiff["Parent Sku"] = await getRecordsDiff("parentSKU", "Parent Sku", csvRecord, mantleRecord);

  //Category
  recordDiff["Category"] = await getRecordsDiff("type", "Category", csvRecord, mantleRecord);

  //Parent Product Name
  if (csvRecord["name"] && csvRecord["name"].trim().length) {

    recordDiff["Parent Product Name"] = await getRecordsDiff("name", "Parent Product Name", csvRecord, mantleRecord);
  }

  //Condition
  recordDiff["Condition"] = await getRecordsDiff("condition", "Condition", csvRecord, mantleRecord);

  //Language
  recordDiff["Language"] = await getRecordsDiff("language", "Language", csvRecord, mantleRecord);

  //Product Name
  //Concat Parent, Condition & Language
  try {

    if (parentProductName.trim().length && condition.trim().length && language.trim().length()) {
      const productName = util.format("%s - %s %s", parentProductName, condition, language);
      recordDiff["Product Name"] = await getRecordsDiff("", "Product Name", csvRecord, mantleRecord, productName);
    }
  } catch (error) {

  }

  //Description
  recordDiff["Description"] = await getRecordsDiff("text", "Description", csvRecord, mantleRecord);

  //Short Code
  try {
    if (csvRecord["setCode"] && csvRecord["setCode"].trim().length && csvRecord["number"] && csvRecord["number"].trim().length) {
      const shortCode = util.format("%s-'%s", csvRecord["setCode"], csvRecord["number"]);
      recordDiff["Short Code"] = await getRecordsDiff("", "Short Code", csvRecord, mantleRecord, shortCode);
    }
  } catch (error) {
    
  }

  //Rarity
  recordDiff["Rarity"] = await getRecordsDiff("rarity", "Rarity", csvRecord, mantleRecord);

  //Mana Cost
  recordDiff["Mana Cost"] = await getRecordsDiff("manaValue", "Mana Cost", csvRecord, mantleRecord);

  //Color
  recordDiff["Color"] = await getRecordsDiff("colors", "Color", csvRecord, mantleRecord);

  //Card Type
  recordDiff["Card Type"] = await getRecordsDiff("type", "Card Type", csvRecord, mantleRecord);

  //Rules Text
  if (rulingData) {
    const ruleText = rulingData["text"]
    recordDiff["Rules Text"] = await getRecordsDiff("", "Rules Text", csvRecord, mantleRecord, ruleText);
  }
  //Power
  recordDiff["Power"] = await getRecordsDiff("power", "Power", csvRecord, mantleRecord);

  //Toughness
  recordDiff["Toughness"] = await getRecordsDiff("toughness", "Toughness", csvRecord, mantleRecord);

  //Flavor Text
  recordDiff["Flavor Text"] = await getRecordsDiff("flavorText", "Flavor Text", csvRecord, mantleRecord);

  //Artist
  recordDiff["Artist"] = await getRecordsDiff("artist", "Artist", csvRecord, mantleRecord);

  //Card Number
  recordDiff["Card Number"] = await getRecordsDiff("number", "Card Number", csvRecord, mantleRecord);



  //remove nulls
  for (var key in recordDiff) {
    if (recordDiff.hasOwnProperty(key)) {
      if (recordDiff[key] == null) delete recordDiff[key];
    }
  }

  if (Object.keys(recordDiff).length != 0) {
    recordDiff["Status"] = "Updated";
    recordDiff["Child Sku"] = csvRecord["childSKU"]
    recordDiff["Mantle SKU"] = csvRecord["childSKU"]
    //dataResult.push(recordDiff)
    await generateResultCSv([recordDiff]).catch(err =>{
      console.error(err)
    })
  }

};

const getRecordsDiff = async (csvKey, mantleKey, csvRecord, mantleRecord, value = null) => {
  try {

    if (value != null) {
      if (value && value.trim().length) {
        if (value.toLowerCase() != mantleRecord[mantleKey].toLowerCase()) {
          return value;
        }
      }
    } else if (csvRecord[csvKey] && csvRecord[csvKey].toString().trim().length) {
      if (csvRecord[csvKey].toLowerCase() != mantleRecord[mantleKey].toLowerCase()) {
        return csvRecord[csvKey];
      }
    }

  } catch (err) {
    //console.error(err)
  }
  return null;
}

const newRecords = async (csvRecord, setData, rulingData) => {
  var newRecord = {};
  var childSKU = csvRecord["childSKU"];
  var parentSKU = csvRecord["parentSKU"];
  var condition = csvRecord["condition"];
  var language = csvRecord["language"];

  newRecord = {
    "Set Name": setData ? setData["name"] : null,
    "Release Date": setData ? setData["releaseDate"] : null,
    "Parent Sku": parentSKU,
    "Product Type": "Child",
    "Product Line": "Magic",
    "Category": csvRecord["type"],
    "Parent Product Name": csvRecord["name"],
    "Condition": condition,
    "Language": language,
    "Product Name": util.format("%s - %s %s", csvRecord["name"], condition, language),
    "Description": csvRecord["text"],
    "Short Code": util.format("%s-'%s", csvRecord["setCode"], csvRecord["number"]),
    "Rarity": csvRecord["rarity"],
    "Mana Cost": csvRecord["manaValue"],
    "Color": csvRecord["colors"],
    "Card Type": csvRecord["type"],
    "Rules Text": rulingData ? rulingData["text"] : null,
    "Power": csvRecord["power"],
    "Toughness": csvRecord["toughness"],
    "Flavor Text": csvRecord["flavorText"],
    "Artist": csvRecord["artist"],
    "Card Number": csvRecord["number"],
  }
  //remove nulls
  for (var key in newRecord) {
    if (newRecord.hasOwnProperty(key)) {
      if (newRecord[key] == null || newRecord[key] == "" || newRecord[key] == undefined) delete newRecord[key];
    }
  }

  if (Object.keys(newRecord).length != 0) {
    newRecord["Status"] = "New";
    newRecord["Child Sku"] = childSKU
    newRecord["Mantle SKU"] = childSKU
    //dataResult.push(newRecord)
    await generateResultCSv([newRecord]).catch(err =>{
      console.error(err)
    });
  }

}

/**
 * Create destination directory upfront
 */
const createResultsCsv = async () => {
  console.info("Creating Result csv location")
  await fse.ensureDirSync(resolve(resultCsvPath));

  await fse.move(resolve(resultCsvPath), resolve(resultCsvPathArch), {
      overwrite: true
    })
    .then(() => {
      console.info('Old Results Moved to Arch!')
    })
    .catch(err => {
      console.error(err)
    });

  await fse.ensureDirSync(resolve(resultCsvPath));
}

const generateResultCSv = (dataStageResult, retryCount = 0) => new Promise(async(resolved, reject)=> {
  /* 
    console.info("Generating Results CSV Data")
    console.info(dataStageResult.length); */
  try {
    if (dataStageResult.length > 0) {
      if(retryCount == 0)
         rCount = rCount + dataStageResult.length;
  
      try {
        csvWriter.writeRecords(dataStageResult).then(()=>{
          resolved()
        });
        
      } catch (error) {
        console.error(error)
        if(retryCount < 2){
          await generateResultCSv(dataStageResult, retryCount+1)
        }
        else{
          throw new Error(error)
        }
      }
  
    }
    else{
      resolved()
    }
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }
});