const createTable = (doc, paymentReceiptInfo) => {
  let total = {
    head_name: "TOTAL",
    applicable_fee: paymentReceiptInfo?.applicableFee,
    paid_fee: paymentReceiptInfo?.paidFee,
    // remain_fee: paymentReceiptInfo?.remaingFeeManual ?? 0,
    remain_fee: paymentReceiptInfo?.remainFee ?? 0,
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
    datas: [...paymentReceiptInfo?.feeheadList, total],
  };

  // Draw the table on the current page
  doc.table(table, {
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
  });
};

module.exports = createTable;
