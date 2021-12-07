const fs = require("fs");
const config = require("config");
const {
    resolve,
    join
} = require("path");
const fileUpload = require("../helpers/fileUpload");
const sqlGen = require("../helpers/sqlGenerator")
const pricing = require("../helpers/pricingUpdates")
const resultCsvPath = `${config.get("zip.resultCsvPath")}`;
const passCode = config.get("passCode");


exports.getFiles = async (req, res) => {
    fs.readdir(resolve(resultCsvPath), function (err, files) {
        if (err) {
            res.status(500).send({
                message: "Unable to scan files!",
            });
        }
        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: req.protocol + "://" + req.headers.host + "/" + "file/" + file,
            });
        });

        res.status(200).send(fileInfos);
    })
}

exports.downloadFile = async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = resolve(join(resultCsvPath, fileName));
    res.download(filePath, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            })
        }
    })
}

exports.uploadMagicFile = async (req, res) => {
    req.setTimeout(900000, function () {
        // call back function is called when request timed out.
    });

    if (req.body.passCode != passCode.toString()) {
        res.status(201).send({
            message: "Invalid Authorization Code"
        });
        return
    }
    try {
        const fileName = req.files.file.name;

        await fileUpload.fileUpload(req)

        await sqlGen.generateMtgSql(fileName).then(sqlFilePath => {

            res.download(resolve(sqlFilePath), (err) => {
                if (err) {
                    res.status(500).send({
                        message: "Could not download the file. " + err,
                    })
                }
            })
        });

    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file:. ${err}`,
        });
    }

}

exports.uploadTCGPricingFile = async (req, res) => {
    req.setTimeout(900000, function () {
        // call back function is called when request timed out.
    });

    if (req.body.passCode != passCode.toString()) {
        res.status(201).send({
            message: "Invalid Authorization Code"
        });
        return
    }
    try {
        const fileName = req.files.file.name;

        await fileUpload.fileUpload(req)

        await pricing.updateMantlePrices(fileName).then(response => {
            res.status(200).send(response)
        }).catch(err=>{
            res.status(500).send(err)
        });
        
    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file:. ${err}`,
        });
    }
}