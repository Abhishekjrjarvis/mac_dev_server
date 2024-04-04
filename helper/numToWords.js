function numToWords(number) {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "Ten",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
  
    function convertToWords(num) {
      if (num < 10) {
        return ones[num];
      } else if (num < 20) {
        return teens[num - 10];
      } else {
        const digit1 = Math.floor(num / 10);
        const digit2 = num % 10;
        return tens[digit1] + (digit2 ? " " + ones[digit2] : "");
      }
    }
  
    const crore = Math.floor(number / 10000000);
    const lakh = Math.floor((number % 10000000) / 100000);
    const thousand = Math.floor((number % 100000) / 1000);
    const hundred = Math.floor((number % 1000) / 100);
    const remaining = number % 100;
  
    let words = "";
  
    if (crore) {
      words += convertToWords(crore) + " Crore ";
    }
    if (lakh) {
      words += convertToWords(lakh) + " Lakh ";
    }
    if (thousand) {
      words += convertToWords(thousand) + " Thousand ";
    }
    if (hundred) {
      words += convertToWords(hundred) + " Hundred ";
    }
    if (remaining) {
      words += convertToWords(remaining);
    }
  
    return words.trim();
  }
  module.exports = numToWords;