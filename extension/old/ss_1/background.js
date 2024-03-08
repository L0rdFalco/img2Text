'use strict';

function sendMessage(message) {
  chrome.tabs.query({ active:true, currentWindow:true },
    (tabs) => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, message);
    }
  );
}

// contextMenu
chrome.runtime.onInstalled.addListener(
  () => {
    chrome.contextMenus.create({
      type: 'normal',
      title: 'Crop It!',
      id: 'cropIt',
      contexts: ['all']
    });
  }
);

chrome.contextMenus.onClicked.addListener(
  (info, tab) => {
    const { menuItemId } = info;

    switch (menuItemId) {
      case 'cropIt':
        sendMessage({ action: 'activeCropIt' });
        break;
    }
  }
);

// browserAction
chrome.action.onClicked.addListener(
  (tab) => {
    sendMessage({ action: 'activeCropIt' });
  }
);

// tunnel
chrome.runtime.onMessage.addListener(
  ({ action = '', ...request }, sender, sendResponse) => {
    const dataUrl = request?.dataUrl;

    switch (action) {
      case 'capture':
        chrome.tabs.captureVisibleTab(null, { format:'png' },
          (image) => {
            sendResponse({ image });
          }
        );
        break;
      case 'download': 
        if (dataUrl) {
          const date = new Date();
          const filename = `Crop It ${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} at ${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.png`;
          chrome.downloads.download({
            url: dataUrl,
            filename: filename,
            conflictAction: 'uniquify',
            saveAs: false
          })
        }
        break;
    }

    return true;
  }
);