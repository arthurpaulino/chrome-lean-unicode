/*
Copyright (c) 2022 Arthur Paulino. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Author: Arthur Paulino
*/

const ESCAPE_CHAR_ID = "escape_char";
const URL_MATCHES_ID = "url_matches";
const IS_ON_ID       = "is_on";
const SAVE_ID        = "save";

const SET_SETTINGS = "SET_SETTINGS";

const INPUT_LISTENER_NAME = "input";

const escapeCharField  = document.getElementById(ESCAPE_CHAR_ID);
const urlMatchesField  = document.getElementById(URL_MATCHES_ID);
const onByDefaultField = document.getElementById(IS_ON_ID);
const saveButton       = document.getElementById(SAVE_ID);

var oldEscapeChar = "\\";

chrome.storage.sync.get(
    null,
    settings => {
        escapeCharField.innerText = settings[ESCAPE_CHAR_ID];
        urlMatchesField.innerText = settings[URL_MATCHES_ID].join("\n");
        onByDefaultField.checked  = settings[IS_ON_ID];

        oldEscapeChar = escapeCharField.innerText;

        escapeCharField.addEventListener(
            INPUT_LISTENER_NAME,
            e => {
                var val = e.target.innerText.replace(/[\n\s]+/g, "");
                switch (val.length) {
                    case 0:
                        e.target.innerText = oldEscapeChar;
                        break;
                    case 1:
                        e.target.innerText = val;
                        break;
                    case 2:
                        e.target.innerText = val[0] !== oldEscapeChar ? val[0] : val[1];
                        break;
                    default:
                        e.target.innerText = val[val.length - 1];
                    }
                oldEscapeChar = e.target.innerText;
            }
        );
    }
);

saveButton.onclick = () => {
    const settings = {};
    settings[ESCAPE_CHAR_ID] = escapeCharField.innerText;
    settings[IS_ON_ID]       = onByDefaultField.checked;
    settings[URL_MATCHES_ID] = urlMatchesField.innerText    
        .replace(/[;,\s\n]+/g, "\n").split("\n");
    chrome.storage.sync.set(
        settings,
        () => {
            chrome.tabs.query(
                {},
                tabs => {
                    for (const tab of tabs) {
                        chrome.tabs.sendMessage(
                            tab.id,
                            { type: SET_SETTINGS, data: settings }
                        );
                    }
                    close();
                }
            );
        }
    );
};
