const csv = require("csv-parser");
const fs = require("fs");
const config = require("config");
const db = require("../models/db");
const {
    resolve,
    join
} = require("path");
const {
    Op,
    QueryTypes
} = require("sequelize");
const util = require('util');
const uploadsPath = `${config.get("zip.uploadsPath")}`;
var sqlOutput = "";

exports.updateMantlePrices = (fileName) => new Promise(async (resolved, reject) => {

    try {

        sqlOutput = util.format('%s%s_%s.%s', uploadsPath, fileName.replace(".csv", ""), new Date().toISOString().substr(0, 19).split('T').join('').split('-').join('').split(':').join(''), 'sql');
        await fs.appendFileSync(resolve(sqlOutput), "BEGIN TRANSACTION;" + "\n");

        await fs.createReadStream(resolve(join(uploadsPath, fileName)))
            .on("error", (error) => {
                console.error(error);
                reject(error)
            })

            .pipe(csv())
            .on("data", (row) => {
                var rowData = {
                    "Child Sku": row["TCGplayer Id"],
                    "TCG Market Price": row["TCG Market Price"],
                    "TCG Direct Low": row["TCG Direct Low"],
                    "TCG Low Price": row["TCG Low Price"]
                };

                rowData = sanitizeRecord(rowData)
                if (rowData) {
                    getRecordSQL(rowData)
                }
            })
            .on("end", async () => {

                await fs.appendFileSync(resolve(sqlOutput), "COMMIT TRANSACTION;" + "\n");

                const sqlQuery = await fs.readFileSync(resolve(sqlOutput), {
                    encoding: "utf8"
                });

                try {

                    await db.sequelize.query(sqlQuery, {
                        raw: true,
                        logging: false
                    });
                } catch (error) {
                    console.error(error);
                    reject({
                        "error":error
                    })
                }

                resolved({
                    message: "Pricing Data successfully updated"
                })
                console.info("Pricing Data successfully updated");
            });
    } catch (error) {
        console.error(error);
        reject(error);
    }
});


/**
 * 
 * @param {*} record 
 * @returns object with all null and empty keys removed
 */
const sanitizeRecord = (record) => {
    if (record["Child Sku"] != undefined && record["Child Sku"] != null) {
        if (record["Child Sku"].toString().trim().length) {
            Object.keys(record).forEach(k => {
                if (record[k]) {
                    if (record[k] == undefined || record[k] == null || !record[k].toString().trim().length) {
                        delete record[k]
                    }
                } else {
                    delete record[k]
                }
            })
            return record;
        }
    }
    return null
}

const getRecordSQL = async (record) => {

    record["date_updated"] = new Date(new Date().toUTCString());
    const childSku = record["Child Sku"];
    delete record["Child Sku"];

    let sql = await db.sequelize.dialect.queryGenerator.updateQuery(
        db.MantleMTG.getTableName(),
        record, {
            "Child Sku": childSku
        }, {
            model: db.MantleMTG,
            type: QueryTypes.UPDATE,
            bindParam: false,
            mapToModel: true,
            //upsertKeys:["Child Sku"],
            //updateOnDuplicate:Object.keys(record)
            raw: true
        },

    );

    fs.appendFileSync(resolve(sqlOutput), sql.query + ";\n");

    //console.log(sql.query)
}