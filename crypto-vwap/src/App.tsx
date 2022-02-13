import React, { useState } from "react";
import { Button } from "devextreme-react/button";
import SelectBox from "devextreme-react/select-box";
import DateBox from "devextreme-react/date-box";
import notify from "devextreme/ui/notify";
import "./App.css";

const ERROR = "network error or yahoo cryto API changed";

const App = () => {
  const instruments = [
    "CRO-USD",
    "BTC-USD",
    "ETH-USD",
    "BNB-USD",
    "OKB-USD",
    "HT-USD",
  ];
  const now = new Date();
  const start = new Date("2021-05-24");

  const [appConfig, setAppConfig] = useState({
    symbol: "CRO-USD",
    startTimestamp: start,
    endTimestamp: now,
    vwap: 0,
  });

  const onSymbolChanged = (e: any) => {
    console.log(e);
    setAppConfig({
      ...appConfig,
      symbol: e.value,
    });
  };

  const onStartTsChanged = (e: any) => {
    console.log(e);
    setAppConfig({
      ...appConfig,
      startTimestamp: e.value,
    });
  };

  const onEndTsChanged = (e: any) => {
    console.log(e);
    setAppConfig({
      ...appConfig,
      endTimestamp: e.value,
    });
  };

  const downloadVwap = () => {
    try {
      const startTs = Math.floor(+appConfig.startTimestamp * 0.001);
      const endTs = Math.floor(+appConfig.endTimestamp * 0.001);
      const url =
        `https://query1.finance.yahoo.com/v7/finance/download/${appConfig.symbol}` +
        `?period1=${startTs}&period2=${endTs}&interval=1d&events=history&includeAdjustedClose=true`;
      const link = document.createElement("a");
      link.target = "_blank";
      link.href = url;
      link.download = `${appConfig.symbol}-${appConfig.startTimestamp}-${appConfig.endTimestamp}.csv`;
      link.click();
    } catch (error: any) {
      notify(`${error.message || ERROR}`, "warning", 10000);
    }
  };

  const queryVwap = () => {
    const startTs = Math.floor(+appConfig.startTimestamp * 0.001);
    const endTs = Math.floor(+appConfig.endTimestamp * 0.001);
    const url = `/query?symbol=${appConfig.symbol}&startTs=${startTs}&endTs=${endTs}`;
    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        if (response.ok) {
          setAppConfig({
            ...appConfig,
            vwap: response.message,
          });
        } else {
          notify(response.message || ERROR, "warning", 10000);
        }
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <form style={{ width: 358 }}>
          <div className="dx-field">
            <div className="dx-field-label">VWAP</div>
            <div className="dx-field-value">{appConfig.vwap}</div>
          </div>

          <div className="dx-field">
            <div className="dx-field-label">Crypto Symbol</div>
            <div className="dx-field-value">
              <SelectBox
                items={instruments}
                searchEnabled={true}
                defaultValue={"CRO-USD"}
                placeholder="Search..."
                onValueChanged={onSymbolChanged}
              />
            </div>
          </div>

          <div className="dx-field">
            <div className="dx-field-label">Start Date</div>
            <div className="dx-field-value">
              <DateBox
                type="date"
                defaultValue={appConfig.startTimestamp}
                onValueChanged={onStartTsChanged}
              />
            </div>
          </div>

          <div className="dx-field">
            <div className="dx-field-label">End Date</div>
            <div className="dx-field-value">
              <DateBox
                type="date"
                defaultValue={appConfig.endTimestamp}
                onValueChanged={onEndTsChanged}
              />
            </div>
          </div>

          <div className="dx-field" style={{ justifyContent: "center" }}>
            <div className="dx-field-value">
              <Button
                width="160px"
                text="Download"
                type="success"
                stylingMode="contained"
                onClick={downloadVwap}
              />
            </div>

            <div className="dx-field-value" style={{ marginLeft: 38 }}>
              <Button
                width="160px"
                text="Calculate VWAP"
                type="success"
                stylingMode="contained"
                onClick={queryVwap}
              />
            </div>
          </div>
        </form>
      </header>
    </div>
  );
};

export default App;
