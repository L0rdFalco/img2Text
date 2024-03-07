
chrome.runtime.onInstalled.addListener(async function (details) {

    if (details.reason === "install") {

    }

})

async function cookieChecker(cb) {
    let res = await chrome.cookies.getAll({ url: "https://imagetotext-lper.onrender.com/" })

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
