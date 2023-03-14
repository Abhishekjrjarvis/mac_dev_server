const XLSX = require("xlsx");

const workbook = XLSX.readFile("data.xlsx");
// const asArray = XLSX.utils.sheet_to_json(workbook, {
//   header: 1,
// });
let allJsonList = [];
for (let i = 0; i < workbook.SheetNames?.length; i++) {
  console.log(workbook.SheetNames[i]);
  //   console.log(workbook.Sheets[workbook.SheetNames[i]]);
  const dynamicSheet = workbook.Sheets[workbook.SheetNames[i]];
  const asArray = XLSX.utils.sheet_to_json(dynamicSheet, {
    header: "A",
    raw: true,
    // blankrows: true,
    range: 5,
  });
  for (let i = 1; i <= asArray?.length; i++) {
    let jsonObj = {};
    for (let ob in asArray[i]) {
      // if(ob === "E"){

      // }
      jsonObj[asArray[0][ob]] = asArray[i][ob];
    }
    allJsonList.push(jsonObj);
  }
  console.log("asArray", allJsonList);
}
