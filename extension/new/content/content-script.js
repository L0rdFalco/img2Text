'use strict';


async function elementInserter() {

    try {
        if (document.getElementById("info-id")) return;

        const mainDiv = document.createElement('div');
        const textDiv = document.createElement('div');

        mainDiv.classList.add("item");
        textDiv.classList.add("text");
        mainDiv.id = "info-id";
        textDiv.id = "textId";
        let res = await chrome.storage.local.get(["randQuote"])

        textDiv.innerText = JSON.stringify(res.randQuote)
        mainDiv.appendChild(textDiv);

        document.querySelector("body").insertAdjacentElement("beforebegin", mainDiv);


    }
    catch (e) {
        console.log("element insertion failed", e);

    }

}


window.onload = (async function (e) {
    try {
        const savedColor = await chrome.storage.local.get(["bgColor"])

        Array.from(document.getElementsByClassName("item"))[0].style.backgroundColor = savedColor.bgColor
    } catch (error) {
        console.log(error);

    }



})

chrome.storage.onChanged.addListener((changes, namespace) => {
    location.reload()
})


elementInserter()



