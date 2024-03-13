
const tes = require("tesseract.js");

exports.extractText = (request, response, next) => {
    try {
        (async () => {
            const data = request.body

            let xData = null

            Object.keys(data).forEach(key => {
                xData = data[key];

            });
            let xxData = xData.split("------WebKit")[0]
            let xxxData = xxData.split('tent"')[1]

            const fData = xxxData.replace(/\?/g, "+");

            const worker = await tes.createWorker('eng');
            const ret = await worker.recognize(fData);
            const extractedText = ret.data.text
            console.log(extractedText);
            await worker.terminate();



            return response.status(200).json({ message: extractedText })

            //maybe save all this stuff to the db later on
        })();

    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "text extraction failed" })
    }

}