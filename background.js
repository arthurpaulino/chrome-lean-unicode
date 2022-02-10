/*
Copyright (c) 2022 Arthur Paulino. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Author: Arthur Paulino
*/

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === "setIconPath") {
            chrome.action.setIcon({
                "path": request.data,
                "tabId": sender.tab.id
            });
        }
        else if (request.type === "getSettings") {
            try {
                chrome.storage.sync.get(null, sendResponse);
            }
            catch {
                sendResponse(null);
            }
        }
        else if (request.type === "setSettings") {
            chrome.storage.sync.set(request.data);
        }
    });