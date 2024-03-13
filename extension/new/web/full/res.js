const extractBtn = document.getElementById("extract_btn")
const extractedTextEl = document.getElementById("extracted_text")
const ssEl = document.getElementById("ss_img")

function xpost(endpoint, imgUrl) {

    (async () => {


        try {

            console.log(imgUrl);
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


            return await res1.json()


            console.log("returned whole image res: ", res2);

            //open new tab here on success response




        } catch (error) {

            console.log(error);
        }

    })()
}



chrome.runtime.sendMessage({ message: "from-newtab-getUrl-whole" }, (res) => {

    if (res.data) {

        ssEl.src = res.data.whole_imgUrl
    }
})

extractBtn.addEventListener("click", function (e) {
    //hit api and set text to element
    //remove the imgUrl from storage
    const imgDataUrl = ssEl.getAttribute("src")

    if (imgDataUrl.startsWith("data:image/png;base64")) {

        const mText = xpost("http://127.0.0.1:3000/m/extract-text", imgDataUrl)

        extractedTextEl.innerText = mText

    }


})
