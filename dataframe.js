var DataFrame = require("dataframe-js").DataFrame;

const async_createDataFrame = async (csv) => {
  const dfPromise = DataFrame.fromCSV("new.csv");

  dfPromise.then((df) => {
    df.show();
  });
};
// const df = new DataFrame.fromCSV("new.csv").then((df) => df);

// const df = async_createDataFrame("new.csv");

const dfPromise = DataFrame.fromCSV("new.csv");

dfPromise.then((df) => {
  df.show();
});
