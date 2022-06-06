const request = require("superagent");
const fs = require("fs");
const extract = require('extract-zip')
const config = require('config');
const {
    resolve,
    join,
} = require("path");
var http = require('http');
var https = require('https');
const store = require('store2');
var axios = require('axios');
const moment = require('moment');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const href = "https://gitlab.com/malie-library/pkmncards/-/archive/main/pkmncards-main.zip";
const zipFile = "downloads/pkmncards-main.zip";
const extractPath = "downloads/pkmncards-main";
const outFilePath = "downloads/result/pkmncards-main.csv";
const columns = [
    {
        id: "Mantle SKU",
        title: "Mantle SKU"
    },
    {
        id: "Child Sku",
        title: "Child Sku"
    },
    {
        id: "Parent SKU",
        title: "Parent SKU"
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
        id: "Card Type",
        title: "Card Type"
    },
    {
        id: "Energy Type",
        title: "Energy Type"
    },
    {
        id: "HP",
        title: "HP"
    },
    {
        id: "Retreat Cost",
        title: "Retreat Cost"
    },
    {
        id: "Weakness",
        title: "Weakness"
    },
    {
        id: "Resistance",
        title: "Resistance"
    },
    {
        id: "Rules Text",
        title: "Rules Text"
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
    },
    {
        id: "Foil",
        title: "Foil"
    },
    {
        id: "Color",
        title: "Color"
    }
];
//var processedRecords = [];
const api_url = "https://api.tcgplayer.com/";
const client_id = "8E58924A-F4C4-4644-A733-28096F50211C";
const client_secret = "B90E4D65-C820-4CF6-B994-B32ADEDF7F10";
const STORE_KEY = "7d315bbc";
const X_TCG_ACCESS_TOKEN = 'be4eee1c-aeb5-49e4-8ddc-393a25858b6b';
const VERSION = 'v1.39.0';
var csvWriter = {}
var failedId = []
const reProcess = false;
var faileRecords = []

const pkmnConditions = [
    {
        "conditionId": 1,
        "name": "Near Mint",
        "abbreviation": "NM",
        "displayOrder": 1
    },
    {
        "conditionId": 2,
        "name": "Lightly Played",
        "abbreviation": "LP",
        "displayOrder": 2
    },
    {
        "conditionId": 3,
        "name": "Moderately Played",
        "abbreviation": "MP",
        "displayOrder": 3
    },
    {
        "conditionId": 4,
        "name": "Heavily Played",
        "abbreviation": "HP",
        "displayOrder": 4
    },
    {
        "conditionId": 5,
        "name": "Damaged",
        "abbreviation": "DM",
        "displayOrder": 5
    },
    {
        "conditionId": 6,
        "name": "Unopened",
        "abbreviation": "U",
        "displayOrder": 6
    }
]

const pkmnPrintings = [
    {
        "printingId": 10,
        "name": "Normal",
        "displayOrder": 1,
        "modifiedOn": "2013-04-03T11:43:38.8"
    },
    {
        "printingId": 11,
        "name": "Holofoil",
        "displayOrder": 2,
        "modifiedOn": "2013-04-03T11:43:38.8"
    },
    {
        "printingId": 77,
        "name": "Reverse Holofoil",
        "displayOrder": 3,
        "modifiedOn": "2017-12-20T11:04:27.92"
    },
    {
        "printingId": 78,
        "name": "1st Edition",
        "displayOrder": 4,
        "modifiedOn": "2017-12-20T11:04:27.92"
    },
    {
        "printingId": 79,
        "name": "1st Edition Holofoil",
        "displayOrder": 5,
        "modifiedOn": "2017-12-20T11:04:27.92"
    },
    {
        "printingId": 122,
        "name": "Unlimited",
        "displayOrder": 6,
        "modifiedOn": "2021-10-14T21:29:33.397"
    },
    {
        "printingId": 123,
        "name": "Unlimited Holofoil",
        "displayOrder": 7,
        "modifiedOn": "2021-10-14T21:29:33.397"
    }
]


exports.dwnExtract = async () => {
    processedRecords = [];

    var dt = new Date();

    console.info("Downloads and Extracts started at " + dt.toISOString())

    await request
        .get(href)
        .on("error", function (error) {
            console.log(error);
            store.set("PKMN_TASK_RUNNING", true);
        })
        .pipe(fs.createWriteStream(zipFile))
        .on("finish", async () => {
            console.info("Downloading .zip files completed");
            await extractFiles(zipFile, extractPath);
            await processPkmnFiles();
            //await downloadMantleMTGRecords(); Yonah
            console.info("Downloads Completed");

            dt = new Date();

            console.info("Downloads and Extracts completed at " + dt.toISOString())

            store.set("PKMN_TASK_RUNNING", true);

        });
}

extractFiles = (zipFilePath, outputDirPath) => new Promise(async (resolved, reject) => {
    try {
        await extract(resolve(zipFilePath), {
            dir: resolve(outputDirPath)
        })
        console.info(".zip Extraction Completed");
        resolved();
    } catch (error) {
        console.error(error);
        reject();
    }
});

processPkmnFiles = () => new Promise(async (resolved, reject) => {
    failedId = []
    faileRecords = []

    if(reProcess){

        let repro = fs.readFileSync("downloads/result/failed.json", { encoding: "utf8" });
        faileRecords = JSON.parse(repro);

        console.log("faileRecords")
        console.log(faileRecords)

        csvWriter = createCsvWriter({
            path: resolve(outFilePath),
            header: columns,
            alwaysQuote: true,
            append: true
        });
    }
    else{
        csvWriter = createCsvWriter({
            path: resolve(outFilePath),
            header: columns,
            alwaysQuote: true,
            //append: true
        });
        csvWriter.writeRecords([]).then(() => {
            //Once 1st record is created, now allow append
            csvWriter = createCsvWriter({
                path: resolve(outFilePath),
                header: columns,
                alwaysQuote: true,
                append: true
            });
        })
    }

    var files = getAllFiles(extractPath+'/pkmncards-main/data', []);
    //files = files.splice(103)

    while (files.length) {
        console.log('Files Count')
        console.log(files.length)

        const promises = files.splice(0, 50).map(file => processRecord(file));
        await Promise.all(promises).catch((error)=>{
            console.error("Files Promise", error)
        });
    }

    console.log("Processing Competed")

    fs.writeFile("downloads/result/failed.json", JSON.stringify(failedId), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
     
        console.log("JSON file has been saved.");
    });

    /*files.slice(0,1).forEach(async(file) => {
        try {
            let rawdata = fs.readFileSync(file, { encoding: "utf8" });
            let setRecords = JSON.parse(rawdata);
            setRecords.forEach(async(record) => {
                try {
                    const data = record.data;
                    if (data != undefined) {
                        await mapRecords(data);
                    }
                } catch (error) {
                    console.error(error, file)
                }
            });
        } catch (error) {
            console.error(error, file)
        }
    });*/



    resolved()
});

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            if (file.endsWith('.json'))
                arrayOfFiles.push(join(dirPath, "/", file));
        }
    })

    return arrayOfFiles
}

const processRecord = (file) => new Promise(async (resolved, reject) => {
    try {
        console.log("file file")
        console.log(file)

        let rawdata = fs.readFileSync(file, { encoding: "utf8" });
        let setRecords = JSON.parse(rawdata);

        if(setRecords.length > 0){
            const promises = setRecords.map(record => mapRecords(record));
            await Promise.all(promises).catch((error)=>{
                console.error("ProcessRecord Promise", error)
            });
        }

        /*for (let i = 0; i < setRecords.length; i++) {
            try {
                const record = setRecords[i];
                const data = record.data;
                if (data != undefined) {
                    await mapRecords(data);
                }

            } catch (error) {
                console.error(error, 'setRecords')
            }
            
        }*/
    } catch (error) {
        console.error(error, 'files')
        resolved()
    }
    resolved()
});

const mapRecords = (data) => new Promise(async (resolved, reject) => {
    var processedRecords = []
    data = data.data;

    try {

        if (data?.tcgplayer_id != undefined && data?.tcgplayer_id?.toString() != "-1") {
            

            if(reProcess){
                const failed = faileRecords.filter(x => x.productId == data?.tcgplayer_id?.toString());
                if(failed.length <= 0){
                    console.log(`Already processed `)
                    resolved()
                    return;
                }
            }

            var parentData = {
                "Parent SKU": data.tcgplayer_id,
                // "Mantle SKU": data.tcgplayer_id,
                //"Child Sku": data.tcgplayer_id,
                "Product Type": "Child",
                "Product Line": "Pokemon",
                "Category": data.pkmn_set,
                "Parent Product Name": data.card_name,
                //"Product Name": data.post_title,
                //"Language": data.pkmn_language,
                "Release Date": data.release_date_unix,
                "Set Name": data.pkmn_set,
                "Rarity": data.pkmn_rarity,
                "Card Type": data.pkmn_stage,
                "HP": data.pkmn_hp,
                "Retreat Cost": data.pkmn_retreat_cost,
                "Weakness": data["pkmn_weakness"]?.join(),
                "Resistance": data["pkmn_resistance[]"]?.join(),
                "Rules Text": data.card_text,
                "Flavor Text": data.flavor_text,
                "Artist": data["pkmn_artist[]"]?.join(),
                "Card Number": data.card_number,
                //"Foil": data.pkmn_print_type,
                "Color": data["pkmn_color[]"]?.join()
            }
            const header = await getRequestHeader()

            const productDetails = await getProductDetails(data.tcgplayer_id, header, data.post_ID)
            //console.info("\r\nproductDetails received")
            //console.info(productDetails)

            if(productDetails != null){
                for (let index = 0; index < productDetails?.results?.length; index++) {
    
                    try {
                        //console.info("productSummary start")

                        const productDetail = productDetails.results[index];
                        //Only english
                        if(productDetail.languageId == 1){

                            const condition = pkmnConditions.find(x => x.conditionId == productDetail.conditionId);
                            const printing = pkmnPrintings.find(x => x.printingId == productDetail.printingId);

                            const skuDetails = {
                                "Mantle SKU": productDetail.skuId.toString(),
                                "Child Sku": productDetail.skuId.toString(),
                                "Foil": null,
                                "Language": 'English',
                                "Condition": condition?.name,
                                "Product Name": `${data.card_name} - ${condition?.name} ${printing?.name} English`,
                            }

                            processedRecords.push({ ...skuDetails, ...parentData });
                        }


                        /*const url = api_url + `${VERSION}/stores/${STORE_KEY}/inventory/products?groupId=${productDetail.groupId}&productName=${productDetail.name}`
                        const productSummary = await axios.get(url, header).catch(function (error) {

                            failedId.push({productId:data.tcgplayer_id , post_ID:data.post_ID})
                            
                            if (error.response) {
                                // Request made and server responded
                                console.log(error.response.data, 'productSummary');
                                //console.log(error.response.status, 'productSummary');
                                //console.log(error.response.headers, 'productSummary');
                            } else if (error.request) {
                                // The request was made but no response was received
                                console.log(error.request, 'productSummary req');
                            } else {
                                // Something happened in setting up the request that triggered an Error
                                console.log(error.message, 'productSummary');
                            }
                        });*/
                        //console.info("productSummary received")
    
                        /*const results = productSummary?.data?.results;
                        if (results != undefined) {
                            const productSum = results.filter(x => x.productId.toString() === data.tcgplayer_id.toString());
                            
                            productSum.forEach(product => {

                                if(product?.skus?.length == 0){
                                    console.log(`No SKU`)
                                    console.log(data.tcgplayer_id)
                                }
                                product?.skus?.forEach(sku => {
                                    if (sku.language.name == 'English') {

                                        const foil = sku.foil == true ? 'Foil' : 'Non Foil';
                                        const skuDetails = {
                                            "Mantle SKU": sku.skuId.toString(),
                                            "Child Sku": sku.skuId.toString(),
                                            "Foil": foil,
                                            "Language": sku.language.name,
                                            "Condition": sku.condition.name,
                                            "Product Name": `${data.card_name} ${sku.condition.name} ${foil}`,
                                        }
    
                                        processedRecords.push({ ...skuDetails, ...parentData });
                                    }
                                })
                            })
                            //console.info(`productSummary   complted`)
                        }*/
                    } catch (error) {
                        var err = error?.response?.data;
                        if (err == undefined)
                            err = error;
                        console.error(err, 'getProductDetails()')
                    }
    
                }
            }

            if (processedRecords.length > 0) {

                //console.info(`writting ${processedRecords.length} records`)
                csvWriter.writeRecords(processedRecords).then(() => {
                    //console.info(`writting records completed`)
                    resolved()
                }).catch((err)=>{
                    console.error("CSV WRITTER", err)
                    resolved()
                })
            }
            else{
                resolved()
            }
        }
        else {
            console.info(`Undefined TCG ID for ${data?.post_ID}`)
            resolved()
        }

    } catch (error) {
        console.error(error, 'mapRecords()')
        resolved()
    }

});


const getRequestHeader = async () => {
    const authToken = await getBearerToken()


    return {
        'timeout': 60000,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'X-Tcg-Access-Token': X_TCG_ACCESS_TOKEN,
            'Authorization': 'Bearer ' + authToken
        }
    }
}

const getBearerToken = async () => {

    const token_expires_at = store.get("TCG_BEARER_TOKEN_EXPIRY")
    if (token_expires_at != undefined) {

        if (moment().isBefore(token_expires_at)) {
            return store.get("TCG_BEARER_TOKEN")
        }
    }

    var header = {
        headers: {
            'Content-Type': 'text/plain',
            'X-Tcg-Access-Token': X_TCG_ACCESS_TOKEN
        }
    }

    const requestPayload = `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`;

    const token = await axios.post(api_url + 'token', requestPayload, header);
    store.set("TCG_BEARER_TOKEN_EXPIRY", moment().add(token.data.expires_in, 'seconds'));
    store.set("TCG_BEARER_TOKEN", token.data.access_token);
    return token.data.access_token;

}

const getProductDetails = async (productId, header, post_ID) => {
    try {

        //const header = await getRequestHeader()

        //const url = api_url + `${VERSION}/catalog/products/${productId}?getExtendedFields=true`
        const url = api_url + `${VERSION}/catalog/products/${productId}/skus`
        const productDetails = await axios.get(url, header)

        return productDetails.data
    } catch (error) {

        failedId.push({productId:productId , post_ID:post_ID})

        console.error(`Error ${productId}`)
    }
    return null

}