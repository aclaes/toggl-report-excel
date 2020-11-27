const csvParse = require("csv-parse");
const fs = require("fs");

const CSV_COL_DESCRIPTION = 5;
const CSV_COL_DATE = 7;
const CSV_COL_DURATION = 11;

// Read path to CSV file from arguments
const csvPath = process.argv[2];

if (!csvPath) {
  throw "ERROR: no CSV path given";
}

const durationInMinutes = (duration = "") => {
  const parts = duration.split(":");
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  return hours * 60 + minutes;
};

const prepareDescription = (description = "") => {
  const regexTicket = /^([A-Z0-9]+-[0-9]+):.+$/g;
  const regexMeeting = /^Meeting:\s?(.+)$/g;
  const regexPLAN = /^PLAN:/g;

  let res;

  if (description.match(regexTicket)) {
    res = description.replace(regexTicket, "$1");
  }

  if (description.match(regexMeeting)) {
    res = description.replace(regexMeeting, "$1");
  }

  if (description.match(regexPLAN)) {
    res = "PLAN";
  }

  if (!res) {
    throw `Error: UNUSUAL DESCRIPTION: ${description}`;
  }

  return res.trim();
};

const prepareDateOutput = (date) => {
  let regexp = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/g;
  return date.replace(regexp, "$<day>.$<month>.$<year>");
};

const prepareDurationOutpu = (duration) => {
  const hours = Math.floor(duration / 60);
  const quarters = Math.round((duration - hours * 60) / 15);
  if (quarters === 0) {
    return hours;
  } else if (quarters === 2) {
    return `${hours},5`;
  } else if (quarters == 4) {
    return hours + 1;
  }

  return `${hours},${quarters * 25}`;
};

const processRows = (rows = []) => {
  // Sort all entries with days as keys
  const days = rows.reduce((acc, row, index) => {
    if (index > 0) {
      let description = row[CSV_COL_DESCRIPTION];
      let date = row[CSV_COL_DATE];
      let duration = row[CSV_COL_DURATION];

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push({
        description: prepareDescription(description),
        duration: durationInMinutes(duration),
      });
    }
    return acc;
  }, {});

  // console.log(days);

  const aggregatedDays = Object.keys(days).reduce((acc, date) => {
    let day = days[date];

    // Combine durations of equal tasks
    let combinedEntries = new Map();

    day.forEach((item) => {
      if (item.description !== "Daily") {
        if (!combinedEntries.has(item.description)) {
          combinedEntries.set(item.description, item);
        } else {
          const tmpEntry = combinedEntries.get(item.description);
          combinedEntries.set(item.description, {
            ...tmpEntry,
            duration: tmpEntry.duration + item.duration,
          });
        }
      }
    });

    let combinedEntriesArr = Array.from(combinedEntries.values());

    // Sort so that highest duration is at the start
    combinedEntriesArr.sort((a, b) => b.duration - a.duration);

    let dailyDuration = day
      .filter((entry) => entry.description === "Daily")
      .reduce((acc, curr) => {
        return acc + curr.duration;
      }, 0);

    if (dailyDuration) {
      combinedEntriesArr[0].duration += dailyDuration;
    }

    acc[date] = combinedEntriesArr;

    return acc;
  }, {});

  return aggregatedDays;
};

const formattedOutput = (days) => {
  Object.keys(days).forEach((day) => {
    const dayEntries = days[day];
    dayEntries.map((entry) => {
      const outRow = [
        prepareDateOutput(day),
        prepareDurationOutpu(entry.duration),
        entry.description,
      ];
      console.log('"' + outRow.join('","') + '"');
    });
  });
};

//  Read the CSV file
fs.readFile(csvPath, (err, data) => {
  if (err) {
    throw "Error: " + err;
  }
  // Parse CSV Data
  csvParse(data.toString(), {}, (err, rows) => {
    if (err) {
      throw "Error: " + err;
    }
    // console.log(rows);
    const res = processRows(rows);

    formattedOutput(res);
  });
});
