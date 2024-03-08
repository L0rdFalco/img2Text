// import { createWorker } from 'tesseract.js';

const tes = require("tesseract.js");

(async () => {
    const worker = await tes.createWorker('eng');
    const ret = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
    console.log(ret.data.text);
    await worker.terminate();
})();