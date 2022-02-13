const cors = require("cors");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const https = require("https");

const vwap = (data = []) => {
  try {
    let total = 0;
    let vol = 0;
    for (let i = 0; i < data.length; ++i) {
      const p = (+data[i]["High"] + +data[i]["Low"] + +data[i]["Close"]) / 3;
      vol += +data[i]["Volume"];
      total += p * data[i]["Volume"];
    }

    return { ok: true, message: total / vol };
  } catch (error) {
    return { ok: false, message: error.message };
  }
};

// https://finance.yahoo.com/quote/CRO-USD/history?period1=1613125472&period2=1644661472&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true
// https://query1.finance.yahoo.com/v7/finance/download/CRO-USD?period1=1613125472&period2=1644661472&interval=1d&events=history&includeAdjustedClose=true
const parseCsv = (fileName) => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve(__dirname, fileName))
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const value = vwap(results);
        console.log(value);
        resolve({ ok: value.ok, message: value.message });
      })
      .on("error", (e) => {
        reject({ ok: false, message: e.message });
      });
  });
};

const fetchYahooApi = ({ symbol, startTs, endTs }) => {
  const url =
    `https://query1.finance.yahoo.com/v7/finance/download/${symbol}` +
    `?period1=${startTs}&period2=${endTs}&interval=1d&events=history&includeAdjustedClose=true`;
  const fileName = `./${symbol}.csv`;
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const stream = fs.createWriteStream(path.resolve(__dirname, fileName));
        stream.once("open", function (fd) {
          res.on("data", (d) => {
            stream.write(d);
          });

          res.on("end", () => {
            stream.end();
            resolve({ ok: true, message: fileName });
          });
        });
      })
      .on("error", (e) => {
        reject({ ok: false, message: e.message });
      });
  });
};

module.exports = function (app) {
  app.set("trust proxy", 1);
  app.use(cors());

  app.use("/download", (req, res) => {
    const query = req.query;
    fetchYahooApi({
      symbol: query.symbol,
      startTs: query.startTs,
      endTs: query.endTs,
    }).then((response) => {
      res.json(response);
    });
  });

  app.use("/query", (req, res) => {
    const query = req.query;
    fetchYahooApi(query).then((response) => {
      if (response.ok) {
        parseCsv(response.message).then((result) => {
          result.startTs = new Date(query.startTs * 1000).toLocaleDateString();
          result.endTs = new Date(query.endTs * 1000).toLocaleDateString();
          res.json(result);
        });
      }
    });
  });
};
