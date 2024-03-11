
const path = require("path")
const tes = require("tesseract.js");

exports.extractText = (request, response, next) => {
    try {
        (async () => {
            const image = path.resolve(__dirname, ('../public/assets/img/backgrounds/test1.png'));

            const worker = await tes.createWorker('eng');
            // const ret = await worker.recognize('/public/assets/img/backgrounds/test1.png');
            const ret = await worker.recognize(image);
            console.log(ret.data.text);
            await worker.terminate();
        })();

    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "getTestPage failed" })
    }

}