const extractBtn = document.getElementById("extract_btn")
const extractedTextEl = document.getElementById("extracted_text")
const ssEl = document.getElementById("ss_img")
const errorEl = document.getElementById("error")

function xpost(endpoint, imgUrl) {

    (async () => {

        try {

            console.log(imgUrl);
            const editedData = imgUrl.replace(/\+/g, "?");

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

            errorMessage("server not available. Try again!")

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



chrome.runtime.sendMessage({ message: "from-newtab-getUrl-whole" }, (res) => {

    if (res.data) {

        ssEl.src = res.data.whole_imgUrl
    }
})

extractBtn.addEventListener("click", function (e) {

    extractedTextEl.innerText = "starting text extraction on image on the right..."

    const imgDataUrl = ssEl.getAttribute("src")

    if (imgDataUrl.startsWith("data:image/png;base64")) {

        xpost("https://textfromvideoai.onrender.com/m/extract-text", imgDataUrl)


    }


})
