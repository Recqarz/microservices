import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import PDFDocument from 'pdfkit';

import PQueue from 'p-queue';
import killChrome from './killChrome';

const app = express();
app.use(express.json());

const corsConfig = {
  origin: [
    "http://localhost:4000",
    "https://lms.recqarz.com",
    "https://lms.uat.recqarz.com",
    "https://lms.test.recqarz.com",
  ],
  credentials: true,
};
app.use(cors(corsConfig));

const queue = new PQueue({ concurrency: 10 }); // Limit to 5 concurrent Puppeteer instances
const queue1 = new PQueue({ concurrency:20 }); // Limit to 5 concurrent Puppeteer instances

app.get("/api1", async (req, res) => {
  res.status(200).json({
    msg: "Shree Ganesh"
  });
});

app.post('/api1/view', (req, res) => {
  queue.add(async () => {
    try {
      const { htmlTemplate } = req.body;
      let executablePath;
      // Check the operating system
      if (process.platform === "win32") {
        executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      } else if (process.platform === "linux") {
        executablePath = "/usr/bin/google-chrome"; // or '/usr/bin/google-chrome' for Google Chrome
      } else {
        throw new Error("Unsupported operating system");
      }

      const browser = await puppeteer.launch({
        headless: "new", // Use true for headless mode
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(htmlTemplate);
      const pdfBuffer = await page.pdf({ format: "A4" });
      await browser.close();
      console.log('before send ');
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBuffer);
    } catch (err) {
      console.error('Error generating PDF:', err);
      res.status(500).json({
        msg: err.message
      });
    }
  });
});

let pageGlobal = null;

async function getBrowser() {
  if (pageGlobal) {
    return pageGlobal;
  }

  let executablePath;
  if (process.platform === "win32") {
    executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  } else if (process.platform === "linux") {
    executablePath = "/usr/bin/google-chrome";
  } else {
    throw new Error("Unsupported operating system");
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  pageGlobal = browser;
  return browser;
}

async function generatePDF(htmlTemplate) {
  
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.setContent(htmlTemplate);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    return pdfBuffer;
  } finally {
    await page.close();
  }
}

app.post('/api1/test/view', (req, res) => {
  console.log('adding to q',queue1.pending,queue1.pending >20)
  if (queue1.pending >19){
    killChrome()
    console.log('clearing the q ',queue1.pending)
    queue1.clear()
    const doc = new PDFDocument();

  // Set the response header to indicate a PDF file
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="message.pdf"');

  // Pipe the PDF document to the response
  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(25).text('Please load again, Server is facing heavy load', {
    align: 'center',
  });

  // Finalize the PDF and end the stream
  doc.end();
  return
  }
  queue1.add(async () => {
    try {
      const { htmlTemplate } = req.body;
      const pdfBuffer = await generatePDF(htmlTemplate);

      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (err) {
      console.error('Error generating PDF:', err);
      res.status(500).json({ msg: err.message });
    }
  });
});

app.get('/api1/kill', async (req, res) => {

  try {
      res.sendStatus(200)
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ msg: err.message });
  }
})


app.post('/api1/queue', (req, res) => {
  console.log('adding to q',queue1.pending,queue1.pending >20)
  if (queue1.pending >19){
    killChrome()
    queue1.clear()
    console.log('clearing the q ',queue1.pending)

    const doc = new PDFDocument();

  // Set the response header to indicate a PDF file
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="message.pdf"');

  // Pipe the PDF document to the response
  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(25).text('Please load again, Server is facing heavy load', {
    align: 'center',
  });

  // Finalize the PDF and end the stream
  doc.end();
  return
  }
  queue1.add(async () => {
    try {
      const { htmlTemplate } = req.body;
      const pdfBuffer = await generatePDF(htmlTemplate);

      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (err) {
      console.error('Error generating PDF:', err);
      res.status(500).json({ msg: err.message });
    }
  });
});


const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
