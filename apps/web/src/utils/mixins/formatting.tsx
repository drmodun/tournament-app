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
