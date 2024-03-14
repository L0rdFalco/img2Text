const extractBtn = document.getElementById("extract_btn")
const extractedTextEl = document.getElementById("extracted_text")
const ssEl = document.getElementById("ss_img")
const errorEl = document.getElementById("error")


function xpost(endpoint, imgUrl) {

    (async () => {


        try {

            const editedData = imgUrl.replace(/\+/g, "?");

            // console.log(editedData);

            const formData = new FormData();
            formData.append("content", editedData);

            const res1 = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const res2 = await res1.json()

            extractedTextEl.innerText = res2.message


        } catch (error) {
            errorMessage("Server not available. Try again!")

            console.log(error);
        }

    })()
}


function errorMessage(message) {
    errorEl.innerText = message
    errorEl.style.display = "block"
    extractedTextEl.innerText = ""


    setTimeout(() => {
        errorEl.style.display = "none"

    }, 3000)
}



chrome.runtime.sendMessage({ message: "from-newtab-getUrl-cus" }, (res) => {
    if (res.data) {

        ssEl.src = res.data.cus_imgUrl
    }
})

extractBtn.addEventListener("click", function (e) {


    extractedTextEl.innerText = "starting text extraction on the image on the right..."

    const imgDataUrl = ssEl.getAttribute("src")

    if (imgDataUrl.startsWith("data:image/png;base64")) {

        const mText = xpost("https://imagetotext-lper.onrender.com/m/extract-text", imgDataUrl)


    }


})
