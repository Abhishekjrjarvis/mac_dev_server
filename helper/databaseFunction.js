function limit(c) {
  return this.filter((x, i) => {
    if (i <= c - 1) {
      return true;
    }
  });
}
Array.prototype.limit = limit;

function skip(c) {
  return this.filter((x, i) => {
    if (i > c - 1) {
      return true;
    }
  });
}
Array.prototype.skip = skip;

exports.nested_document_limit = (page, limit, nested_array) => {
  try {
    const skip = (page - 1) * limit;
    var skip_array = nested_array.skip(skip);
    var limit_array = skip_array.limit(limit);
    return limit_array;
  } catch (e) {
    console.log(e);
  }
};

exports.nested_document_select = (nested_array, args1) => {
  try {
    const filter_select = [];
    for (var child of nested_array) {
      for (var [key, value] of Object.entries(child)) {
        if (key === args1) {
          filter_select.push({
            key: value,
          });
        }
      }
    }
    return filter_select;
  } catch (e) {
    console.log(e);
  }
};

// var all_excel = [
//   {
//     excel_file: "export-file/All-All-General-Male-All-18-11.xlsx",
//     excel_file_name: "Tushar Babaji Bhambere",
//     _id: "63ff47e2893b548a135f9316",
//     created_at: "2023-03-01T12:41:06.028Z",
//   },
//   {
//     excel_file: "export-file/All-All-NA-NA-All-19-14.xlsx",
//     excel_file_name: "Abhishek Singh",
//     _id: "63ff56b2176475b39bbd45e7",
//     created_at: "2023-03-01T13:44:18.547Z",
//   },
//   {
//     excel_file: "export-file/All-All-NA-NA-All-19-43.xlsx",
//     excel_file_name: "Pankaj Phad",
//     _id: "63ff5d9a5c2bd9d8b0f72144",
//     created_at: "2023-03-01T14:13:46.145Z",
//   },
//   {
//     excel_file: "export-file/All-All-NA-NA-All-19-57.xlsx",
//     excel_file_name: "Ankush Kumar",
//     _id: "63ff60dd6897e37049230c89",
//     created_at: "2023-03-01T14:27:41.501Z",
//   },
//   {
//     excel_file: "export-file/All-All-General-Male-All-19-58.xlsx",
//     excel_file_name: "All-All-General-Male-All-19-58",
//     _id: "63ff610360a90837569d0e3a",
//     created_at: "2023-03-01T14:28:19.743Z",
//   },
//   {
//     excel_file: "export-file/All-All-NA-NA-All-20-57.xlsx",
//     excel_file_name: "All-All-NA-NA-All-20-57",
//     _id: "63ff6ee98924e0a968990e9b",
//     created_at: "2023-03-01T15:27:37.376Z",
//   },
//   {
//     excel_file: "export-file/All-All-NA-NA-All-22-43.xlsx",
//     excel_file_name: "All-All-NA-NA-All-22-43",
//     _id: "63ff879fc32823ec8a955390",
//     created_at: "2023-03-01T17:13:03.091Z",
//   },
//   {
//     excel_file: "export-file/All-All---Pending-19-49.xlsx",
//     excel_file_name: "All-All---Pending-19-49",
//     _id: "63ffac49ff53d64c48c11414",
//     created_at: "2023-03-01T19:49:29.962Z",
//   },
//   {
//     excel_file: "export-file/All-All---All-19-50.xlsx",
//     excel_file_name: "All-All---All-19-50",
//     _id: "63ffac90ff53d64c48c1142f",
//     created_at: "2023-03-01T19:50:40.090Z",
//   },
//   {
//     excel_file: "export-file/Particular--General--Pending-22-1.xlsx",
//     excel_file_name: "Particular--General--Pending-22-1",
//     _id: "63ffcb2cff53d64c48c116e7",
//     created_at: "2023-03-01T22:01:16.541Z",
//   },
//   {
//     excel_file: "export-file/Particular--General--Pending-22-1.xlsx",
//     excel_file_name: "Particular--General--Pending-22-1",
//     _id: "63ffcb2cff53d64c48c116e7",
//     created_at: "2023-03-01T22:01:16.541Z",
//   },
//   {
//     excel_file: "export-file/Particular--General--Pending-22-1.xlsx",
//     excel_file_name: "Particular--General--Pending-22-1",
//     _id: "63ffcb2cff53d64c48c116e7",
//     created_at: "2023-03-01T22:01:16.541Z",
//   },
// ];

// const nums = [
//   {
//     hello: "World",
//     Awesome: "Marvelous",
//   },
//   {
//     hello: "Marvel",
//     Awesome: "Marvelous",
//   },
// ];
// console.log(nested_document_limit(2, 10, all_excel));
