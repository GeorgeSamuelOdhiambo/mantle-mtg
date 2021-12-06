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
  } = require("sequelize");const util = require('util');
const uploadsPath = `${config.get("zip.uploadsPath")}`;
var sqlOutput = "";

exports.generateMtgSql = (fileName) => new Promise(async(resolved, reject)=>{
    sqlOutput = util.format('%s%s_%s.%s', uploadsPath,fileName.replace(".csv",""), new Date().toISOString().substr(0, 19).split('T').join('').split('-').join('').split(':').join(''), 'sql');
    mtgSQLData = [];

    await fs.appendFileSync(resolve(sqlOutput), "BEGIN TRANSACTION;"+"\n");

    await fs.createReadStream(resolve(join(uploadsPath, fileName)))
        .on("error", (error) => {
            console.error(error);
            reject(error)
        })

        .pipe(csv())
        .on("data", (row) => {
            row = sanitizeRecord(row)
            if (row) {
                getRecordSQL(row)
            }
        })
        .on("end", async () => {
            console.info("SQL Generation Loading Completed");

            await fs.appendFileSync(resolve(sqlOutput), "COMMIT TRANSACTION;"+"\n");
            resolved(sqlOutput)
        });
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

const getRecordSQL = async(record)=>{

    delete record["Status"]
    record["date_updated"] = new Date(new Date().toUTCString());

    let sql = await db.sequelize.dialect.queryGenerator.insertQuery(
        db.MantleMTG.getTableName(),
        record,
        {"Child Sku":record["Child Sku"]},
        {
            model:db.MantleMTG,
            type:QueryTypes.UPDATE, 
            bindParam:false,
            mapToModel:true,
            upsertKeys:["Child Sku"],
            updateOnDuplicate:Object.keys(record)
            //raw:true
        },
        
    );

    fs.appendFileSync(resolve(sqlOutput), sql.query+"\n");

    //console.log(sql.query)
}