import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import { exec } from 'child_process';
import cron from 'node-cron';
import PQueue from 'p-queue';

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
const queue1 = new PQueue({ concurrency:35 }); // Limit to 5 concurrent Puppeteer instances

app.get("/api1", async (req, res) => {
  res.status(200).json({
    msg: "Shree Ganesh"
  });
});

app.post('/api1/view', (req, res) => {
  console.log("hghkjl",queue)
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
      killOrphanedChrome()
      res.sendStatus(200)
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ msg: err.message });
  }
})
// app.post('/api1/cron', (req, res) => {
//     queue.add(async () => {
//       try {


//         var task = cron.schedule('* * * * *', () =>  {
//             console.log('will execute every minute until stopped');
//         });
//         setTimeout(()=>{
//             console.log('first')
//             task.stop()
//         },50000)
//         res.sendStatus(200)
//         // task.stop(); 

//         // const {cron} = req.body.
//         // // Schedule the task to run every 10 minutes
//         // cron.schedule(cron, killOrphanedChrome);
       
//       } catch (err) {
//         console.error('Error generating PDF:', err);
//         res.status(500).json({
//           msg: err.message
//         });
//       }
//     });
//   });

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

// Function to kill orphaned Chrome processes
const killOrphanedChrome = () => {
  console.log('Running scheduled task to kill orphaned Chrome processes...');
  const command = process.platform === 'win32' ? 'taskkill /F /IM chrome.exe' : 'pkill -f chrome';
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error killing Chrome processes: ${error.message}`);
      pageGlobal=null
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    pageGlobal=null
    console.log(`stdout: ${stdout}`);
  });
};


// cron.schedule('*/10 * * * *',killOrphanedChrome)