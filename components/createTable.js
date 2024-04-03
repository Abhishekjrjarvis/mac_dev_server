const createTable = (doc, array) => {
    let total = {
      head_name: "TOTAL",
      applicable_fee: array.reduce((a, b) => a + b.applicable_fee, 0),
      paid_fee: array.reduce((a, b) => a + b.paid_fee, 0),
      remain_fee: array.reduce((a, b) => a + b.remain_fee, 0),
    };
    const table = {
      headers: [
        {
          label: "PARTICULARS",
          property: "head_name",
          width: 185,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [5, 5, 5, 5],
        },
        {
          label: "APPLICABLE",
          property: "applicable_fee",
          width: 120,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          align: "center",
        },
        {
          label: "PAID AMOUNT",
          property: "paid_fee",
          width: 120,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          align: "center",
        },
        {
          label: "REMAINING",
          property: "remain_fee",
          width: 122,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          align: "center",
        },
      ],
      datas: [...array, total],
    };
  
    let remainingRows = table.datas.length; // Total number of rows to be processed
    let currentPage = 0; // Current page index
    let currentRow = 0; // Current row index
  
    while (remainingRows > 0) {
      // Add a new page if the current page is filled
      if (currentPage > 0) {
        doc.addPage();
      }
  
      const pageHeight =
        doc.page.height - doc.page.margins.top - doc.page.margins.bottom - doc.y;
  
      // Calculate the maximum number of rows that can fit on the current page
      const maxRowsPerPage = Math.floor(pageHeight / doc.currentLineHeight());
  
      // Calculate the number of rows to be added to the current page
      const rowsToAdd = Math.min(remainingRows, maxRowsPerPage - currentRow);
  
      // Slice the rows to be added to the current page
      const currentPageData = table.datas.slice(
        currentRow,
        currentRow + rowsToAdd
      );
  
      // Increment current row index
      currentRow += rowsToAdd;
  
      // Decrease remaining rows count
      remainingRows -= rowsToAdd;
  
      // Increment current page index
      currentPage++;
  
      // Draw the table for the current page
      doc.table(
        { ...table, datas: currentPageData },
        {
          prepareHeader: () => doc.font("Times-Bold").fontSize(10),
          prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            if (row.head_name === "TOTAL") {
              doc.font("Times-Bold").fontSize(10);
              doc.addBackground(rectCell, "b4b4b4", 0.08);
            } else {
              doc.font("Times-Roman").fontSize(10);
              doc.addBackground(rectCell, "#a1a1a1", 0);
            }
          },
        }
      );
    }
  };
  
  module.exports = createTable;