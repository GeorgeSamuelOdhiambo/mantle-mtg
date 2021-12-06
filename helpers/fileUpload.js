const util = require("util");
//const multer = require("multer");
const config = require("config");
const {
    resolve,
    join
} = require("path");
var fs = require('fs');

const uploadsPath = `${config.get("zip.uploadsPath")}`;

exports.fileUpload = async(req)=>{
    
    var tmp_path = req.files.file.path;
    console.log(tmp_path)
    var target_path = resolve(join(uploadsPath, req.files.file.name));

    await fs.copyFileSync(tmp_path, target_path, async(err) =>{
        if (err) throw err;

        await fs.unlinkSync(tmp_path, function() {
            if (err) throw err;
            console.info('File uploaded to: ' + target_path);
        });
    });
}