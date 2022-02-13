/*
Copyright (c) 2022 Arthur Paulino. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Author: Arthur Paulino
*/

const SET_ICON_PATH = "SET_ICON_PATH";

chrome.runtime.onMessage.addListener(
    (request, sender, _) => {
        if (request.type === SET_ICON_PATH) {
            chrome.action.setIcon({
                path: request.data,
                tabId: sender.tab.id
            });
        }
    }
);
