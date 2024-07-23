const express = require('express')
const puppeteer = require("puppeteer")
const cors = require('cors')
const app = express()
app.use(express.json())
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
app.get("/api1", async(req,res)=>{
    res.status(200).json({
        msg:"Shree Ganesh"
    })
})

app.post('/api1/view',async(req,res)=>{
    const {htmlTemplate}  = req.body;
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
    });
    const page = await browser.newPage();
    await page.setContent(htmlTemplate);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  
})
app.listen(4001,()=>{
    console.log('App is running on port 4001')
})