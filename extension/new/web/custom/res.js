const extractBtn = document.getElementById("extract_btn")
const extractedTextEl = document.getElementById("extracted_text")
const ssEl = document.getElementById("ss_img")



chrome.runtime.sendMessage({ message: "from-newtab-getUrl-whoe" }, (res) => {
    console.log("returned res: ", res);

    if (res.data) {

        ssEl.src = res.data.cus_imgUrl
    }
})

extractBtn.addEventListener("click", function (e) {
    //hit api and set text to element
    //remove the imgUrl from storage


})
