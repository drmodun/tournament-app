import dateFormat from "dateformat";

// time spans in milliseconds
const TO_YEARS = 1000 * 3600 * 24 * 365;
const TO_MONTHS = TO_YEARS / 12;
const TO_WEEKS = TO_MONTHS / 4;
const TO_DAYS = TO_WEEKS / 7;
const TO_HOURS = TO_DAYS / 24;
const TO_MINUTES = TO_HOURS / 60;
const TO_SECONDS = TO_MINUTES / 60;

// time spans and their names
const TIME_SPANS: { duration: number; name: String }[] = [
  { duration: TO_YEARS, name: "year" },
  { duration: TO_MONTHS, name: "month" },
  { duration: TO_WEEKS, name: "week" },
  { duration: TO_DAYS, name: "day" },
  { duration: TO_HOURS, name: "hour" },
  { duration: TO_MINUTES, name: "minute" },
  { duration: TO_SECONDS, name: "second" },
];

/// Calculates the best way to display a certain upload date
///
/// Example: if the video was uploaded 50 hours ago it will be simplified / rounded to 2 days ago
export const calculateBestPastDateFormat = (targetDate: Date) => {
  // dateDifference is in milliseconds, so we have to convert it to a nicer format
  const dateDifference = Date.now() - targetDate.getTime();

  // this loop iterates for every time span (except seconds) and finds the optimal time span format to display to the user
  for (let i = 0; i < TIME_SPANS.length - 1; i++) {
    // select a time span from TIME_SPANS
    const timeSpan = TIME_SPANS[i];

    if (dateDifference / timeSpan.duration > 0.67) {
      // calculate rounded duration in every time span in TIME_SPANS
      const timeValue = Math.round(dateDifference / timeSpan["duration"]);

      // return in format = value time_span_name/s ago (for example 12 minutes ago)
      return `${timeValue} ${timeValue == 1 ? timeSpan["name"] : timeSpan["name"] + "s"} ago`;
    }
  }
  // if video was uploaded less than 40.2 seconds ago (none of the above conditions were met), it will display as a few seconds ago
  return "few seconds ago";
};

export const calculateBestFutureDateFormat = (date: Date) => {
  const dateDifference = date.getTime() - Date.now();

  for (let i = 0; i < TIME_SPANS.length - 1; i++) {
    const timeSpan = TIME_SPANS[i];

    if (dateDifference / timeSpan.duration > 0.67) {
      const timeValue = Math.round(dateDifference / timeSpan["duration"]);

      return `in ${timeValue} ${timeValue == 1 ? timeSpan["name"] : timeSpan["name"] + "s"}`;
    }
  }

  return "in a few seconds";
};

export const formatDate = (date: Date) => {
  return dateFormat(date, "mmm dS, 'yy").toLowerCase();
};

export const formatDateTime = (date: Date) => {
  return dateFormat(date, "H:MM dd.mm 'yy").toLowerCase();
};

export const calculateBestValueFormat = (targetValue: number) => {
  // value prefixes
  const valueNames = ["", "K", "M", "B", "T", "P", "E", "Z", "Y", "R", "Q"];

  // if the value is less than 1000, no prefix is needed
  if (targetValue < 1000) {
    return targetValue.toString();
  }

  // this loop iterates for every i-th power of 1000 (prefixes) and finds the optimal prefix to display to the user
  for (let i = 1; i < valueNames.length; i++) {
    // store the prefix name
    const valueName = valueNames[i];
    // calculate the value for the according prefix
    let value = targetValue / Math.pow(1000, i);

    // if the value can be used in a bigger prefix, continue iterating
    if (value < 1000) {
      // return in format = value prefix (for example 1.23 K)
      return `${value.toFixed(2)} ${valueName}`;
    }
  }
};

export const COUNTRY_CODES_TO_NAMES = {
  AC: "Antigua and Barbuda",
  AF: "Afghanistan",
  AX: "Aland Islands",
  AL: "Albania",
  DZ: "Algeria",
  AS: "American Samoa",
  AD: "Andorra",
  AO: "Angola",
  AI: "Anguilla",
  AG: "Antigua And Barbuda",
  AR: "Argentina",
  AM: "Armenia",
  AW: "Aruba",
  AU: "Australia",
  AT: "Austria",
  AQ: "Antarctica",
  AZ: "Azerbaijan",
  BS: "Bahamas",
  BH: "Bahrain",
  BD: "Bangladesh",
  BB: "Barbados",
  BY: "Belarus",
  BE: "Belgium",
  BZ: "Belize",
  BJ: "Benin",
  BM: "Bermuda",
  BT: "Bhutan",
  BO: "Bolivia",
  BA: "Bosnia And Herzegovina",
  BW: "Botswana",
  BV: "Bouvet Island",
  BR: "Brazil",
  IO: "British Indian Ocean Territory",
  BN: "Brunei Darussalam",
  BG: "Bulgaria",
  BF: "Burkina Faso",
  BI: "Burundi",
  BQ: "Caribbean Netherlands",
  KH: "Cambodia",
  CM: "Cameroon",
  CA: "Canada",
  CV: "Cape Verde",
  KY: "Cayman Islands",
  CF: "Central African Republic",
  TD: "Chad",
  CL: "Chile",
  CN: "China",
  CX: "Christmas Island",
  CC: "Cocos (Keeling) Islands",
  CO: "Colombia",
  KM: "Comoros",
  CG: "Congo",
  CD: "Congo, Democratic Republic",
  CK: "Cook Islands",
  CR: "Costa Rica",
  CI: 'Cote D"Ivoire',
  HR: "Croatia",
  CU: "Cuba",
  CW: "Curacao",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DK: "Denmark",
  DJ: "Djibouti",
  DM: "Dominica",
  DO: "Dominican Republic",
  EC: "Ecuador",
  EG: "Egypt",
  EU: "European Union",
  SV: "El Salvador",
  GQ: "Equatorial Guinea",
  ER: "Eritrea",
  EE: "Estonia",
  ET: "Ethiopia",
  FK: "Falkland Islands (Malvinas)",
  FO: "Faroe Islands",
  FJ: "Fiji",
  FI: "Finland",
  FR: "France",
  GF: "French Guiana",
  PF: "French Polynesia",
  TF: "French Southern Territories",
  GA: "Gabon",
  GM: "Gambia",
  GE: "Georgia",
  DE: "Germany",
  GH: "Ghana",
  GI: "Gibraltar",
  GR: "Greece",
  GL: "Greenland",
  GD: "Grenada",
  GP: "Guadeloupe",
  GU: "Guam",
  GT: "Guatemala",
  GG: "Guernsey",
  GN: "Guinea",
  GW: "Guinea-Bissau",
  GY: "Guyana",
  HT: "Haiti",
  HM: "Heard Island & Mcdonald Islands",
  VA: "Holy See (Vatican City State)",
  HN: "Honduras",
  HK: "Hong Kong",
  HU: "Hungary",
  IC: "Canary Islands",
  IS: "Iceland",
  IN: "India",
  ID: "Indonesia",
  IR: "Iran, Islamic Republic Of",
  IQ: "Iraq",
  IE: "Ireland",
  IM: "Isle Of Man",
  IL: "Israel",
  IT: "Italy",
  JM: "Jamaica",
  JP: "Japan",
  JE: "Jersey",
  JO: "Jordan",
  KZ: "Kazakhstan",
  KE: "Kenya",
  KI: "Kiribati",
  KR: "Korea",
  KP: "North Korea",
  KW: "Kuwait",
  KG: "Kyrgyzstan",
  LA: 'Lao People"s Democratic Republic',
  LV: "Latvia",
  LB: "Lebanon",
  LS: "Lesotho",
  LR: "Liberia",
  LY: "Libyan Arab Jamahiriya",
  LI: "Liechtenstein",
  LT: "Lithuania",
  LU: "Luxembourg",
  MO: "Macao",
  MK: "Macedonia",
  MG: "Madagascar",
  MW: "Malawi",
  MY: "Malaysia",
  MV: "Maldives",
  ML: "Mali",
  MT: "Malta",
  MH: "Marshall Islands",
  MQ: "Martinique",
  MR: "Mauritania",
  MU: "Mauritius",
  YT: "Mayotte",
  MX: "Mexico",
  FM: "Micronesia, Federated States Of",
  MD: "Moldova",
  MC: "Monaco",
  MN: "Mongolia",
  ME: "Montenegro",
  MS: "Montserrat",
  MA: "Morocco",
  MZ: "Mozambique",
  MM: "Myanmar",
  NA: "Namibia",
  NR: "Nauru",
  NP: "Nepal",
  NL: "Netherlands",
  AN: "Netherlands Antilles",
  NC: "New Caledonia",
  NZ: "New Zealand",
  NI: "Nicaragua",
  NE: "Niger",
  NG: "Nigeria",
  NU: "Niue",
  NF: "Norfolk Island",
  MP: "Northern Mariana Islands",
  NO: "Norway",
  OM: "Oman",
  PK: "Pakistan",
  PW: "Palau",
  PS: "Palestinian Territory, Occupied",
  PA: "Panama",
  PG: "Papua New Guinea",
  PY: "Paraguay",
  PE: "Peru",
  PH: "Philippines",
  PN: "Pitcairn",
  PL: "Poland",
  PT: "Portugal",
  PR: "Puerto Rico",
  QA: "Qatar",
  RE: "Reunion",
  RO: "Romania",
  RU: "Russian Federation",
  RW: "Rwanda",
  BL: "Saint Barthelemy",
  SH: "Saint Helena",
  KN: "Saint Kitts And Nevis",
  LC: "Saint Lucia",
  MF: "Saint Martin",
  PM: "Saint Pierre And Miquelon",
  VC: "Saint Vincent And Grenadines",
  WS: "Samoa",
  SM: "San Marino",
  ST: "Sao Tome And Principe",
  SA: "Saudi Arabia",
  SN: "Senegal",
  RS: "Serbia",
  SC: "Seychelles",
  SL: "Sierra Leone",
  SG: "Singapore",
  SK: "Slovakia",
  SI: "Slovenia",
  SB: "Solomon Islands",
  SS: "South Sudan",
  SO: "Somalia",
  ZA: "South Africa",
  GS: "South Georgia And Sandwich Isl.",
  ES: "Spain",
  LK: "Sri Lanka",
  SD: "Sudan",
  SR: "Suriname",
  SJ: "Svalbard And Jan Mayen",
  SZ: "Swaziland",
  SE: "Sweden",
  SX: "Sint Maarten",
  CH: "Switzerland",
  SY: "Syrian Arab Republic",
  TA: "Tristan da Cunha",
  TW: "Taiwan",
  TJ: "Tajikistan",
  TZ: "Tanzania",
  TH: "Thailand",
  TL: "Timor-Leste",
  TG: "Togo",
  TK: "Tokelau",
  TO: "Tonga",
  TT: "Trinidad And Tobago",
  TN: "Tunisia",
  TR: "Turkey",
  TM: "Turkmenistan",
  TC: "Turks And Caicos Islands",
  TV: "Tuvalu",
  UG: "Uganda",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  US: "United States",
  UM: "United States Outlying Islands",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VU: "Vanuatu",
  VE: "Venezuela",
  VN: "Vietnam",
  VG: "Virgin Islands, British",
  VI: "Virgin Islands, U.S.",
  WF: "Wallis And Futuna",
  EH: "Western Sahara",
  YE: "Yemen",
  XK: "Kosovo",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};

export const COUNTRY_NAMES_TO_CODES = Object.fromEntries(
  Object.entries(COUNTRY_CODES_TO_NAMES).map(([code, name]) => [name, code]),
);
