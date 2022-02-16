/*
Copyright (c) 2022 Arthur Paulino. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Author: Arthur Paulino
*/

const SET_ICON_PATH  = "SET_ICON_PATH";
const INSTALL_REASON = "install";

const ESCAPE_CHAR_KEY = "escape_char";
const URL_MATCHES_KEY = "url_matches";
const IS_ON_KEY       = "is_on";

const DEFAULT_SETTINGS = {};
DEFAULT_SETTINGS[ESCAPE_CHAR_KEY] = "\\";
DEFAULT_SETTINGS[IS_ON_KEY] = true;
DEFAULT_SETTINGS[URL_MATCHES_KEY] = [
    "https://leanprover.zulipchat.com",
    "https://github.com/leanprover-community/mathlib"
];

chrome.runtime.onInstalled.addListener(function(details){
    if (details.reason === "install") {
        chrome.storage.sync.set(DEFAULT_SETTINGS);
    }
});

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
