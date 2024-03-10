
const tes = require("tesseract.js");

exports.extractText = (request, response, next) => {
    try {
        (async () => {
            const worker = await tes.createWorker('eng');
            const ret = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
            console.log(ret.data.text);
            await worker.terminate();
        })();

    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "getTestPage failed" })
    }

}