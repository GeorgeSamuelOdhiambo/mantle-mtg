const csv = require("csv-parser");
const fs = require("fs");
const config = require("config");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const util = require('util');
const fse = require('fs-extra');
const axios = require('axios');
const store = require('store2');
const ciqlJSON = require('ciql-json');
const {
    resolve,
    join
} = require("path");
const ygoImageDownloader = require('./ygoImagesDownloader')
const uploadsPath = `${config.get("zip.uploadsPath")}`;
const resultCsvPath = `${config.get("zip.resultCsvPath")}`;
const imageIdsPath = resolve(config.get("images.ygo.imageIds"));
const populateColumns = [
    {
        id: "Card Attribute",
        title: "Card Attribute"
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
        id: "Link Arrows",
        title: "Link Arrows"
    },
    {
        id: "ATK Value",
        title: "ATK Value"
    },
    {
        id: "DEF Value",
        title: "DEF Value"
    },
    {
        id: "LINK Value",
        title: "LINK Value"
    },
    {
        id: "Scale Value",
        title: "Scale Value"
    },
    {
        id: "Level Value",
        title: "Level Value"
    },
    {
        id: "Card Number",
        title: "Card Number"
    },
    {
        id: "Child Sku",
        title: "Child Sku"
    },
    {
        id: "Image",
        title: "Image"
    }
]
var csvWriter = {}
var columns = []
var csvInitialized = false;
var outFilePath = "";
var shortCodes = []
var cardDataresults = {}
var rowData = []
var processedRecords = []
const Service = require('axios-middleware').Service;
//const service = new Service(axios);
var queueLimit = 20;
var queueCount = 0;
const retryMs = 3000;

/* service.register({
    async onRequest(config) {
        console.log('onRequest')
        queueCount++;
        //await validateRateLimit();
        return config;
    },
    onSync(promise) {
        return promise;
    },
    async onResponse(response) {
        console.log('onResponse')
        queueCount--;
        return response;
    }
}); */

const validateRateLimit = async () => {

    return new Promise((resolve, reject) => {
        if (queueCount > queueLimit) {
            console.log(`Rate limit exceeded ${queueCount}, next retry ${retryMs}`)
            setTimeout(async () => {
                const isFree = await validateRateLimit()
                if (isFree) {
                    resolve(true)
                }
            }, retryMs)
        }
        else {
            console.log('rate mimit okay')
            resolve(true)
        }
    })
}

exports.populateRecords = (fileName, downloadImages=0) => new Promise(async (resolved, reject) => {
    outFilePath = util.format('%s%s_%s.%s', resultCsvPath, fileName.replace(".csv", ""), new Date().toISOString().substr(0, 19).split('T').join('').split('-').join('').split(':').join(''), 'csv');
    const promises = [];
    await fs.createReadStream(resolve(join(uploadsPath, fileName)))
        .on("error", (error) => {
            console.error(error);
            store.set("TASK_RUNNING", false);
        })
        .pipe(csv())
        .on("data", (row) => {
            //promises.push(processRecord(row))
            cacheRowData(row)
        })
        .on("end", async () => {
            //await Promise.all(promises);
            await processAllCached()
            await updateImageIds()
            store.set("TASK_RUNNING", false);
            console.info("Yughio CSV Data Processing end");
            if(downloadImages == 1){
                try {
                    ygoImageDownloader.dwnZipImages()
                } catch (error) {
                    
                }
            }
            resolved(outFilePath)
        });
});

const initCsvWriter = (row) => new Promise(async (resolved, reject) => {
    console.log('Initializing Yughio data')
    csvInitialized = true;

    for (const [key, value] of Object.entries(row)) {
        columns.push({
            id: key,
            title: key
        })
    }

    populateColumns.forEach(column => {
        const colValue = columns.filter(x => x.id == column.id)
        if (colValue.length == 0) {
            columns.push(column)
        }
    });

    //var CSV_PATH = util.format('%s%s', resultCsvPath,outFilePath);
    csvWriter = createCsvWriter({
        path: resolve(outFilePath),
        header: columns,
        alwaysQuote: true,
        //append:true
    });

    csvWriter.writeRecords([]).then(() => {
        //Once 1st record is created, now allow append
        csvWriter = createCsvWriter({
            path: resolve(outFilePath),
            header: columns,
            alwaysQuote: true,
            append: true
        });
        resolved()
    })

})

const cacheRowData = (row) => {
    if (!csvInitialized) {
        initCsvWriter(row)
    }

    rowData.push(row)
    const xx = shortCodes.find(x => x.shortCode == row['Short Code'])

    if (xx == null &&  row['Short Code'].toString().trim().length > 0) {
        shortCodes.push({
            shortCode: row['Short Code'],
            name: row['Parent Product Name']
        })
    }
}

const processAllCached = () => new Promise(async (resolved, reject) => {
    const tot = shortCodes.length;
    console.log(`To process ${shortCodes.length} records`)
    try {
        for (let i = 0; i < shortCodes.length; i++) {
            
            try {
                await getCardData(shortCodes[i].name, shortCodes[i].shortCode)
            } catch (error) {
                console.error(error)
            }
            console.log(`${i} of ${tot}`)
        }

        console.log("Data fetching completed")
        const promises = [];

        rowData.forEach((row) => {
            promises.push(processRecord(row))
        });

        await Promise.all(promises);

        await generateResultCSv([]);

        resolved()
    } catch (error) {
        console.error(error)
        reject()
    }
});

const processRecord = async (row) => new Promise(async (resolved, reject) => {

    if (row['Parent Product Name'].trim().length > 0) {

        const cardData = await getCardData(row['Parent Product Name'], row['Short Code'])

        if (cardData != null && cardData != undefined) {
            const cardAttribute = cardData.family != null?cardData.family:cardData.card_type;
            const cardType = cardData.type != null?cardData.type: ''.concat(cardData.property).concat(' ').concat(cardData.card_type);

            row['Card Attribute'] = cardAttribute;//cardData.family;
            row['Card Type'] = cardType;//cardData.type;
            row['Rules Text'] = cardData.text;
            row['Link Arrows'] = null;
            row['ATK Value'] = cardData.atk;
            row['DEF Value'] = cardData.def;
            row['LINK Value'] = null;
            row['Scale Value'] = null;
            row['Level Value'] = cardData.level;
            try {
                row['Card Number'] = row['Short Code'].split('-')[1]
            } catch (error) {

            }
            row['Child Sku'] = row['Mantle SKU']
            row['Image'] = `./assets/img/cards/ygo/${row['Short Code']}.jpeg`
        }
        processedRecords.push(row);
        //await generateResultCSv([row]);
    }

    resolved()
})

const getCardData = async (card_name, shortCode, reTry = false) => {
    var result = null;

    if (shortCode in cardDataresults) {
        console.log(`API result for ${shortCode} already exists`)
        result = cardDataresults[shortCode];
    }
    else {
        console.info(`Fetchung data for ${card_name}`)
        try {
            const obs = await axios({
                method: 'get',
                url: `http://yugiohprices.com/api/card_data/${card_name}`,
                timeout: 5000 // only wait for 2s
            })
            /* await axios.get(`http://yugiohprices.com/api/card_data/${card_name}`, {
                tiemout:3000
            }) */

            if (obs.data) {
                if (obs.data.status == 'success') {
                    result = obs.data.data
                    cardDataresults[shortCode] = result
                }
                //Incase of name typo in the uploaded file
                else if (obs.data.status == 'fail' && obs.data.message.includes('No cards matching this name') && !reTry) {
                    const pricingData = await axios({
                        method: 'get',
                        url: `https://yugiohprices.com/api/price_for_print_tag/${shortCode}`,
                        timeout: 5000 // only wait for 2s
                    })//await axios.get(`https://yugiohprices.com/api/price_for_print_tag/${shortCode}`)
                    if (pricingData.data) {
                        if (pricingData.data.status == 'success') {
                            result = await getCardData(pricingData.data.data.name, shortCode, true)
                        }
                    }
                }
            }
        } catch (error) {
            if (error.response) {
                //console.log(error.response.data);
                console.log(error.response.status);
                //console.log(error.response.headers);
            }
            else {
                console.error(error)
            }

        }
    }
    return result;

}

const generateResultCSv = (dataStageResult = [], retryCount = 0) => new Promise(async (resolved, reject) => {
    console.log("Generating Yughio cvs")

    if(dataStageResult.length == 0)
        dataStageResult = processedRecords;

    try {
        if (dataStageResult.length > 0) {
            /*  if(retryCount == 0)
                rCount = rCount + dataStageResult.length; */

            try {
                csvWriter.writeRecords(dataStageResult).then(() => {
                    resolved()
                });

            } catch (error) {
                console.error(error)
                if (retryCount < 2) {
                    await generateResultCSv(dataStageResult, retryCount + 1)
                }
                else {
                    throw new Error(error)
                }
            }

        }
        else {
            resolved()
        }
    } catch (err) {
        console.error(err)
    }
});

const updateImageIds = () => new Promise(async (resolved, reject) => {
    
    let imgIds = fs.readFileSync(imageIdsPath, { encoding: "utf8" });
    const data = JSON.parse(imgIds);
    var existingIds = data['short_codes'];

    var codes = shortCodes.map(x => {
        return x.shortCode
    })

    codes = codes.concat(existingIds)

    let uniquecodes = [...new Set(codes)];

    try {
        ciqlJSON.open(imageIdsPath)
            .set("short_codes", uniquecodes)
            .save()

        console.info("Images json updated")
        resolved()
    } catch (error) {
        console.error(error)
        reject()
    }
});
