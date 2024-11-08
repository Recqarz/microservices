import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

async function killChrome() {
  const command = process.platform === 'win32'
    ? 'taskkill /F /IM chrome.exe'
    : 'sudo pkill -f chrome';  // Linux/macOS with sudo

  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

export default killChrome;
