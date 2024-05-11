function wrapText(doc, text, x, y, maxWidth, align = "center") {
  let words = text.split(" ");
  let line = "";
  let yPosition = y;

  doc.font("Times-Roman");

  words.forEach((word, index) => {
    let testLine = line + word + " ";
    let testWidth = doc.widthOfString(testLine);

    if (testWidth > maxWidth && index > 0) {
      doc.text(line, x, yPosition, { align });
      line = word + " ";
      yPosition += doc.currentLineHeight();
    } else {
      line = testLine;
    }
  });

  doc.text(line, x, yPosition, { align });
}

module.exports = wrapText;
