const util = require("util");
//const multer = require("multer");
const config = require("config");
const {
    resolve,
    join
} = require("path");
var fs = require('fs');

const uploadsPath = `${config.get("zip.uploadsPath")}`;

exports.fileUpload = async(req, overwrite=false)=>{
    
    var tmp_path = req.files.file.path;
    console.log(tmp_path)
    var target_path = resolve(join(uploadsPath, req.files.file.name));
    
    if(overwrite){
        try {
            await fs.unlinkSync(target_path)
        } catch (error) {
            console.error(error)
        }
    }
    
    await fs.copyFileSync(tmp_path, target_path,fs.constants.COPYFILE_EXCL)

    await fs.unlinkSync(tmp_path, function() {
        if (err) throw err;
        console.info('File uploaded to: ' + target_path);
    });
    
}