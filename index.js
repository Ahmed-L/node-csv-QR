const DataFrame = require("dataframe-js").DataFrame;
const csv = require("csv-parser");
const fs = require("fs");
const qr = require("qrcode");

let records = [];

async function createQRCode(data) {
  const qrCode = await qr.toDataURL(data);
  return qrCode;
}

function createDataFrameFromCSV(csvFilePath) {
  return new Promise((resolve, reject) => {
    let records = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row, index) => {
        records.push(row);
      })
      .on("end", () => {
        console.log("CSV file successfully processed");
        const df = new DataFrame(records);
        resolve(df);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function doSomethingWithCSV() {
  try {
    const df = await createDataFrameFromCSV("new.csv");
    console.log("Dataframe: ");
    df.show();
    console.log("Dimensions (including index column): ");
    console.log(df.dim());
    console.log("Content of i-th row: ");
    console.log(df.getRow(0).toArray().slice(1)); // slice out index column
    const data = df.getRow(0).toArray().slice(1);
    // const data = df.getRow(i).toArray().slice(1).join(", "); // Slice out index column and join values
    const qrCode = await createQRCode(data);
  } catch (err) {
    console.error(err);
  }
}

async function generateQRCodes(csvFilePath) {
  const df = await createDataFrameFromCSV(csvFilePath);
  const qrCodes = await Promise.all(
    df.toArray().map((row) => {
      const contact = {
        first_name: row[1],
        last_name: row[2],
        email: row[4],
        phone: row[3],
      };
      const vCard = `BEGIN:VCARD
VERSION:3.0
N:${contact.last_name};${contact.first_name};;;
FN:${contact.first_name} ${contact.last_name}
EMAIL:${contact.email}
TEL:${contact.phone}
END:VCARD`;
      return createQRCode(vCard);
    })
  );
  return qrCodes;
}

async function generateHTMLPageWithQRCode(qrCodes, htmlFilePath) {
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>QR Codes</title>
        </head>
        <body>
          ${qrCodes
            .map(
              (qrCode, i) =>
                `<div>
                   <p>Row ${i + 1}</p>
                   <img src="${qrCode}" alt="QR Code">
                 </div>`
            )
            .join("")}
        </body>
      </html>
    `;
  fs.writeFileSync(htmlFilePath, html);
  console.log(`HTML page successfully generated at ${htmlFilePath}`);
}

async function generateQRCodePage(csvFilePath, htmlFilePath) {
  const qrCodes = await generateQRCodes(csvFilePath);
  await generateHTMLPageWithQRCode(qrCodes, htmlFilePath);
}

generateQRCodePage("new.csv", "qrcodes.html");

// doSomethingWithCSV();
