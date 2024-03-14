let accountState = true
let expired = true;
let cookieName = null;


async function cookieChecker(cb) {
    // let res = await chrome.cookies.getAll({ url: "https://imagetotext-lper.onrender.com/" })
    let res = await chrome.cookies.getAll({ url: "http://127.0.0.1:3000/" })

    for (let i in res) {
        if (res[i]["name"] === "Auth_Cookie") {
            expired = false
            break
        }
    }

    if (expired) {

        cb({
            status: false,
            message: "website not logged in"
        })

    }

    else {
        cb({
            status: true,
            message: "website logged in"
        })
    }

}

function sendMessage(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!(tabs[0].url).startsWith("http")) {
            return chrome.notifications.create({ title: "img2Text Error", message: "PROHIBITED PAGE!", iconUrl: "/res/icon24.png", type: "basic" })

        };

        const tabId = tabs[0].id
        chrome.tabs.sendMessage(tabId, message)

    })
}

chrome.runtime.onInstalled.addListener(async function (details) {

    if (details.reason === "install" || details.reason === "update") {
        //open a page showcasing how app works and provides early bird access
    }

})

function xget(url, cb) {

    (async () => {

        try {

            //hit the api here
            let res1 = await fetch(url)

            const res2 = await res1.json()


            const message = res2.message;

            return cb({ payload: message })

        } catch (error) {

            console.log(error);
            chrome.runtime.sendMessage({
                source: "xget",
                message: "Server not available. Try again!",

            });
            // chrome.tabs.query({}, function (tabs) {
            //     tabs.forEach((tab) => {
            //     });
            // });
        }

    })()
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.message === "from-popup-checkauth") {

        cookieChecker(sendResponse)

    }

    else if (request.message === "from-popup-account-status") {
        //hit the api here to find out account status (free or paid)
        xget("http://127.0.0.1:3000/users/account-state", sendResponse)

    }

    else if (request.message === "from-popup-wp") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, function (screenshotUrl) {
            const taken = screenshotUrl.startsWith("data:image/png;base64");
            console.log("taken? ", taken);

            if (taken) {
                chrome.storage.local.set({ "whole_imgUrl": screenshotUrl })
                    .then(() => { });

                const filename = `img2Text_${Date.now()}.png`;

                chrome.downloads.download({
                    url: screenshotUrl,
                    filename: filename,
                    conflictAction: 'uniquify',
                    saveAs: false
                }).then((res) => {
                    if (res) {
                        chrome.notifications.create({ title: "img2Text", message: "Image is currently being processed. Expect it to be open in a new tab in a hot minute", iconUrl: "/res/icon24.png", type: "basic" })

                        openTab("/web/full/res.html", { page: "whole" })

                    }
                })



                sendResponse({ message: "screenshot taken", payload: screenshotUrl })
            }

        })

    }

    else if (request.message === "from-popup-cus") {

        sendMessage({ action: "processImg" })

    }

    else if (request.action === "capture") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (image) => {


            sendResponse({ image })
        })

    }

    else if (request.message === "from-newtab-getUrl-cus") {
        chrome.storage.local.get(["cus_imgUrl"])
            .then((result) => {
                sendResponse({ data: result })
            });

    }

    else if (request.message === "from-newtab-getUrl-whole") {
        chrome.storage.local.get(["whole_imgUrl"])
            .then((result) => {
                sendResponse({ data: result })

            });

    }
    else if (request.action === "download") {
        const imageDataUrl = request.dataUrl

        //use tabId as key
        chrome.storage.local.set({ cus_imgUrl: imageDataUrl })
            .then(() => { });

        openTab("/web/custom/res.html", { page: "cus" })

        if (imageDataUrl) {

            const filename = `img2Text_${Date.now()}.png`;

            chrome.downloads.download({
                url: imageDataUrl,
                filename: filename,
                conflictAction: 'uniquify',
                saveAs: false
            }).then((res) => {
                if (res) {
                    chrome.notifications.create({ title: "img2Text", message: "Image is currently being processed. Expect it to be open in a new tab in a hot minute", iconUrl: "/res/icon24.png", type: "basic" })

                }
            })
        }

    }
    else {

        try {
            sendResponse({
                message: "fail"
            })
        } catch (error) {
            console.log(error);

        }


    }


    return true


})



//another way of open a url in a new tab
function openTab(sentUrl, tabData) {
    chrome.tabs.create({
        url: sentUrl
    })

}

