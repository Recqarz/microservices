import { exec } from 'child_process';

function killChrome() {
  const command = process.platform === 'win32' 
    ? 'taskkill /F /IM chrome.exe' // Windows
    : 'pkill -f chrome';            // macOS/Linux

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

export default killChrome;
