const csv = require("csv-parser");
const fs = require("fs");

const filePath = "D:\\AllPrintings\\card.csv";

exports.readFiles = () => {
  fs.createReadStream(filePath)
    .on("error", (error) => {
      console.error(error);
    })

    .pipe(csv())
    .on("data", (row) => {
      console.log(row.index);
      console.log(row.artist);
      console.log(row.originalText);
    })

    .on("end", () => {
      console.info("the end");
    });
};
