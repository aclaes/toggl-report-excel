# Toggl Report for Excel Import

## Requirements

Node >= Version 14

## Installation

```
npm i
```

## Preparation

Download CSV file from toggl track

```
Reports > Detailed > Download CSV
```

Move downloaded CSV file to a location readable from terminal (e.g. user dir)

## Run

```
node index.js ~/Downloads/Toggl_time_entries_yyyy-mm-dd_to_yyyy-mm-dd.csv | pbcopy
```

Copy & paste CSV data from clipboard into Excel by using the CSV importer.
