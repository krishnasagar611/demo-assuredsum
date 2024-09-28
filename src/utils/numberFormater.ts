export function formatInIndianSystem(num: number): string {
  const lakhs = 100000;
  const crores = 10000000;

  if (num >= crores) {
    return (num / crores).toFixed(2) + " Cr";
  } else if (num >= lakhs) {
    return (num / lakhs).toFixed(2) + " L";
  } else {
    return num.toLocaleString("en-IN");
  }
}

export function convertToIndianWords(num: number): string {
  const singleDigit = [
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
  const twoDigits = [
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
  const tensMultiple = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const tensCrore = ["", "Ten", "Hundred"];

  if (num === 0) return "Zero";

  function convertToWords(n: number, suffix: string): string {
    if (n === 0) return "";

    if (n > 19) {
      return (
        tensMultiple[Math.floor(n / 10)] +
        " " +
        singleDigit[n % 10] +
        " " +
        suffix
      );
    } else {
      return (n < 10 ? singleDigit[n] : twoDigits[n - 10]) + " " + suffix;
    }
  }

  let result = "";

  result += convertToWords(Math.floor(num / 10000000), "Crore ");
  result += convertToWords(Math.floor((num / 100000) % 100), "Lakh ");
  result += convertToWords(Math.floor((num / 1000) % 100), "Thousand ");
  result += convertToWords(Math.floor((num / 100) % 10), "Hundred ");

  if (num > 100 && num % 100) {
    result += "and ";
  }

  result += convertToWords(num % 100, "");

  return result.trim();
}
