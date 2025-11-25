export const ETHIOPIAN_MONTHS_EN = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miyaziya", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
];

export const ETHIOPIAN_MONTHS_AM = [
  "መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", 
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];

export const GREGORIAN_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const GREGORIAN_MONTHS_AM = [
  "ጃንዋሪ", "ፌብሩዋሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን",
  "ጁላይ", "ኦገስት", "ሴፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር"
];

export const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_AM = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"];

interface EthiopianDate {
  year: number;
  month: number; // 1-13
  day: number;
}

export const shiftToEthiopianTimezone = (date: Date): Date => {
  // Ethiopia is UTC+3
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 3));
};

export const toEthiopian = (date: Date): EthiopianDate => {
  // We expect the input date to already be adjusted if needed, 
  // but for standard conversion we usually want the date at that specific instant.
  // However, toEthiopian takes a JS Date object which has local getters.
  // If we want "Ethiopian Date" for "Now", we should pass the shifted date.
  const inputs = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  
  // Offset between Julian and Gregorian calendars
  // This is a simplified conversion suitable for the current era (1900-2100)
  const jdn = getJDN(date);
  
  return jdnToEthiopian(jdn);
};

const getJDN = (date: Date): number => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
};

const jdnToEthiopian = (jdn: number): EthiopianDate => {
  const offset = 1723856;
  const r = (jdn - offset) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  
  const year = 4 * Math.floor((jdn - offset) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;

  return { year, month, day };
};

export const ethiopianToJDN = (year: number, month: number, day: number): number => {
  return (1723856 + 365) + 
         365 * (year - 1) + 
         Math.floor(year / 4) + 
         30 * (month - 1) + 
         day - 1;
};

const jdnToGregorian = (jdn: number): Date => {
  const l = jdn + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l1 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l1 + 1)) / 1461001);
  const l2 = l1 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l2) / 2447);
  const day = l2 - Math.floor((2447 * j) / 80);
  const l3 = Math.floor(j / 11);
  const month = j + 2 - 12 * l3;
  const year = 100 * (n - 49) + i + l3;
  return new Date(year, month - 1, day);
};

export const ethiopianToGregorian = (year: number, month: number, day: number): Date => {
  const jdn = ethiopianToJDN(year, month, day);
  return jdnToGregorian(jdn);
};

export const getEthiopianWeekday = (year: number, month: number, day: number): number => {
  const jdn = ethiopianToJDN(year, month, day);
  return (jdn + 1) % 7; // 0=Sunday, 1=Monday, ...
};

export interface EthiopianTime {
  hours: number;
  minutes: number;
  seconds: number;
  period: string; // Morning, Afternoon, Evening, Night
}

export const getEthiopianTime = (date: Date, language: 'english' | 'amharic'): EthiopianTime => {
  const hours24 = date.getHours();
  const hours = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  let period = "";
  if (hours24 >= 6 && hours24 < 12) {
    period = language === 'english' ? "Morning" : "ጠዋት";
  } else if (hours24 >= 12 && hours24 < 18) {
    period = language === 'english' ? "Afternoon" : "ከሰዓት";
  } else if (hours24 >= 18 && hours24 <= 23) {
    period = language === 'english' ? "Evening" : "ማታ";
  } else {
    period = language === 'english' ? "Night" : "ሌሊት";
  }

  return { hours, minutes, seconds, period };
};

export const toGeez = (number: number): string => {
  const geezNumerals = [
    "", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱",
    "፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺",
    "፻", "፼"
  ];

  if (number === 0) return geezNumerals[0];

  let result = "";
  const numStr = number.toString();
  const len = numStr.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr[len - 1 - i]);
    const pos = i; // 0 for units, 1 for tens, 2 for hundreds, etc.

    if (digit === 0) {
      // Handle zeros (skip unless it's a placeholder needed, but Geez is additive)
      // Special case for 100, 10000 etc. handled by position logic below
      continue;
    }

    if (pos % 2 === 0) {
      // Units, Hundreds, Ten Thousands...
      // 1, 100, 10000
      const group = Math.floor(pos / 2); // 0, 1, 2...
      
      let val = "";
      if (group === 0) {
        val = geezNumerals[digit];
      } else if (group === 1) {
        // Hundreds
        val = (digit === 1 ? "" : geezNumerals[digit]) + geezNumerals[19]; // 19 is ፻
      } else if (group === 2) {
        // Ten Thousands
        val = (digit === 1 ? "" : geezNumerals[digit]) + geezNumerals[20]; // 20 is ፼
      }
      
      result = val + result;
    } else {
      // Tens
      // 10, 1000, 100000
      const group = Math.floor(pos / 2);
      
      let val = geezNumerals[9 + digit]; // 10-90
      
      if (group === 1) {
        // Thousands (Tens of Hundreds) -> e.g. 2000 = 20 * 100
         val = val + geezNumerals[19];
      } else if (group === 2) {
         val = val + geezNumerals[20];
      }
      
      result = val + result;
    }
  }
  
  // Simplified Logic for 1-10000 range commonly used
  // A robust library is better, but let's implement a working version for dates (1-31, 2000-2100)
  
  // Re-implementation for simplicity and correctness in date range
  if (number <= 0) return "";
  
  const asciiDigits = number.toString().split('').map(Number);
  const n = asciiDigits.length;
  let geez = "";
  
  for (let i = 0; i < n; i++) {
    const digit = asciiDigits[n - 1 - i];
    if (digit === 0) continue;
    
    if (i === 0) { // Units
      geez = geezNumerals[digit] + geez;
    } else if (i === 1) { // Tens
      geez = geezNumerals[9 + digit] + geez;
    } else if (i === 2) { // Hundreds
      geez = (digit === 1 ? "" : geezNumerals[digit]) + geezNumerals[19] + geez;
    } else if (i === 3) { // Thousands
      geez = (digit === 1 ? "" : geezNumerals[digit]) + geezNumerals[9 + 1] + geezNumerals[19] + geez; 
      // Wait, 1000 is ፲፻ (10 * 100)
      // Actually 2017 -> 20 100 10 7 -> ፳፻፲፯
      // My manual logic above was getting complicated. Let's use a simpler pair-based approach.
    }
  }

  // Correct Pair-based approach
  // Split into pairs from right: 2017 -> 20, 17
  // 17 -> 10 + 7 -> ፲፯
  // 20 -> ፳
  // 20 * 100 + 17 -> ፳፻ ፲፯
  
  const pairs = [];
  let temp = number;
  while (temp > 0) {
    pairs.push(temp % 100);
    temp = Math.floor(temp / 100);
  }
  
  let finalGeez = "";
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if (pair === 0) continue;
    
    let pairStr = "";
    const tens = Math.floor(pair / 10);
    const units = pair % 10;
    
    if (tens > 0) pairStr += geezNumerals[9 + tens];
    if (units > 0) pairStr += geezNumerals[units];
    
    if (i === 0) {
      finalGeez = pairStr + finalGeez;
    } else if (i === 1) { // Hundreds
      // If pair is 1, and it's 100, we just say ፻ not ፩፻
      // But for 2000 (20 * 100), it is ፳፻
      if (pair === 1) {
         finalGeez = geezNumerals[19] + finalGeez;
      } else {
         finalGeez = pairStr + geezNumerals[19] + finalGeez;
      }
    } else if (i === 2) { // Ten Thousands
       if (pair === 1) {
         finalGeez = geezNumerals[20] + finalGeez;
      } else {
         finalGeez = pairStr + geezNumerals[20] + finalGeez;
      }
    }
  }
  
  return finalGeez;
};
export const getGregorianMonthName = (monthIndex: number, language: 'english' | 'amharic'): string => {
  // monthIndex is 0-based for Gregorian Date object
  if (monthIndex < 0 || monthIndex >= 12) return "";
  return language === 'english' ? GREGORIAN_MONTHS_EN[monthIndex] : GREGORIAN_MONTHS_AM[monthIndex];
};
export const getEthiopianMonthName = (monthIndex: number, language: 'english' | 'amharic'): string => {
  // monthIndex is 1-based from conversion, but arrays are 0-based
  const index = monthIndex - 1;
  if (index < 0 || index >= 13) return "";
  return language === 'english' ? ETHIOPIAN_MONTHS_EN[index] : ETHIOPIAN_MONTHS_AM[index];
};
