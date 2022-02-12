/*
Copyright (c) 2022 Arthur Paulino. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Author: Arthur Paulino
*/

const SET_ICON_PATH = "SET_ICON_PATH";
const GET_SETTINGS  = "GET_SETTINGS";
const SET_SETTINGS  = "SET_SETTINGS";

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.type === SET_ICON_PATH) {
            chrome.action.setIcon({
                path: request.data,
                tabId: sender.tab.id
            });
        }
        else if (request.type === GET_SETTINGS) {
            try {
                chrome.storage.sync.get(null, sendResponse);
            }
            catch {
                sendResponse(null);
            }
        }
        else if (request.type === SET_SETTINGS) {
            chrome.storage.sync.set(request.data);
        }
    }
);
