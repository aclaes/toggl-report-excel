# Toggl Report for Excel Import

## Requirements

Node >= Version 14

## Installlation

```
npm i
```

## Preparation

Move downloaded CSV file to a location readable from terminal (e.g. user dir)

## Run

```
node index.js ~/Toggl_time_entries_2020-11-01_to_2020-11-30.csv | pbcopy
```

Copy & paste CSV data from clipboard into Excel
