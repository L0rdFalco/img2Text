let accountState = false

chrome.runtime.onInstalled.addListener(async function (details) {

    if (details.reason === "install") {

    }

})

async function cookieChecker(cb) {
    // let res = await chrome.cookies.getAll({ url: "https://imagetotext-lper.onrender.com/" })
    let res = await chrome.cookies.getAll({ url: "http://127.0.0.1:3000/" })

    console.log("cookies arr: ", res);

    if (res.length == 0) {

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


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "from-popup-checkauth") {

        cookieChecker(sendResponse)

    }

    else if (request.message === "from-popup-account-status") {
        //hit the api here to find out account status

        if (accountState) {
            sendResponse({ status: true })
        }
        else {
            sendResponse({ status: false })

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

//does not work with my subdomain. Works with localhost tho
chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {

    });


//another way of open a url in a new tab
function openTab() {
    chrome.tabs.create({
        url: "popup/popup.html"
    })
}

