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
    try{

        let {htmlTemplate}  = req.body;
        let executablePath;
        htmlTemplate = `<!DOCTYPE html>
            <html style="font-size: 12px; overflow: auto; background: #FFF; cursor: default;  margin: 0 auto; overflow: hidden; "> 
            <head>
                    <meta charset="utf-8">
                    <title>Areness Attorneys</title>
                    <style>
                            * {
                                    border: 0;
                                    box-sizing: border-box; /* changed from content-box to border-box */
                                    color: inherit;
                                    font-family: inherit;
                                    font-size: inherit;
                                    font-style: inherit;
                                    font-weight: inherit;
                                    line-height: inherit;
                                    list-style: none;
                                    margin: 0;
                                    padding: 0;
                                    text-decoration: none;
                                    vertical-align: top;
                            }
                            strong { font-weight: bold; }
                            p, li{font-size: 12px; margin-bottom:5px;white-space: break-spaces;word-break: break-word;}
            ul,ol{padding-left: 15px;}
            ul li,ol li {list-style: outside;}
                            .page-break { page-break-after: always; } /* CSS for forcing a page break */
                            .notice-footer p { text-align: center; font: 10px/1 'Open Sans', sans-serif; margin-bottom: 0px; }     
                            a {color:#405189;text-decoration: underline;}
                            img {width: 140px !important;height: auto !important;}
                    </style>
            </head>
            <body>
                    <div class="page" style="position: relative;padding: 0.3in;box-sizing: border-box;">
                            <header style="text-align: center; border-bottom: 2px solid #405189;margin-bottom:8px;">
                                    <h3 style="font-weight: bold; font-size: 22px; color: #405189; padding-bottom: 0px;">sd</h3>   
                                    <h4 style="font-weight: bold; font-size: 16px; color: #676464; padding: 0px 0 10px;">df</h4>   
                            </header>
                            <article style="padding-bottom: 60px;font-size: 70%; font-style: normal; line-height: 1.20;text-align: justify;">
                                    <p style="text-align: justify;"><p>dsgv</p></p>
                            </article>
                            <aside style="position: fixed;bottom: 20px;width: auto;left: 0.3in;right: 0.3in;" class="notice-footer">
                                    <div style="border-top: 2px solid #405189;padding-top: 15px;text-align: center; ">
                                            <p style="text-align: center; font-size: 11px;"><p>sdvsdzgvbn</p></p>
                                    </div>
                            </aside>
    
    
                    </aside>
                    </div>
                    <div class="page-break"></div> <!-- This will force a page break -->
                    <div class="page" style="position: relative;padding: 0.3in;box-sizing: border-box;">
                            <header style="text-align: center; border-bottom: 2px solid #405189;margin-bottom:8px;">
                                    <h3 style="font-weight: bold; font-size: 22px; color: #405189; padding-bottom: 0px;">sd</h3>   
                                    <h4 style="font-weight: bold; font-size: 16px; color: #676464; padding: 10px 0;">df</h4>       
                            </header>
                            <article style="padding-bottom: 60px;font-size: 75%; font-style: normal; line-height: 1.20;text-align: justify;">
                                    <p style="text-align: justify;"><p>sdf</p></p>
                            </article>
                            <aside style="position: fixed;bottom: 20px;width: auto;left: 0.3in;right: 0.3in;" class="notice-footer">
                                    <div style="border-top: 2px solid #405189;padding-top: 15px;text-align: center; ">
                                            <p style="text-align: center; font-size: 11px;"><p>sdvsdzgvbn</p></p>
                                    </div>
                            </aside>
                    </div>
            </body>
            </html>`
      
          // Check the operating system
        if (process.platform === "win32") {
        executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
        } else if (process.platform === "linux") {
        console.log('linux path is there ')
        executablePath = "/usr/bin/google-chrome"; // or '/usr/bin/google-chrome' for Google Chrome
        } else {
        throw new Error("Unsupported operating system");
        }
        console.log('before puppeteer launch')
        const browser = await puppeteer.launch({
        headless: "new", // Use true for headless mode
        executablePath,
        });
        console.log('launced successfully')
        const page = await browser.newPage();
        await page.setContent(htmlTemplate);
        const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();
        console.log('before send ')
        res.setHeader("Content-Type", "application/pdf");
        res.send(pdfBuffer);
    }catch(err){
        return res.status(500).json({
            msg:err
        })

    }
  
})
app.listen(4001,()=>{
    console.log('App is running on port 4001')
})