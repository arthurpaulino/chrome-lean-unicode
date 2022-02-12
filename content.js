/*
Copyright (c) 2022 Arthur Paulino. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Author: Arthur Paulino
*/

const SET_ICON_PATH = "SET_ICON_PATH";
const GET_SETTINGS = "GET_SETTINGS";
const SET_SETTINGS = "SET_SETTINGS";

const ON_ICON_PATH  = "on.png";
const OFF_ICON_PATH = "off.png";

const ABBREVIATIONS_PATH = "abbreviations.json";

const INPUT_LISTENER_NAME = "input";

const IS_ON_KEY       = "is_on";
const ESCAPE_CHAR_KEY = "escape_char";
const URL_MATCHES_KEY = "url_matches";

const DEFAULT_SETTINGS = {};
DEFAULT_SETTINGS[IS_ON_KEY] = true;
DEFAULT_SETTINGS[ESCAPE_CHAR_KEY] = "\\";
DEFAULT_SETTINGS[URL_MATCHES_KEY] = [
    "https://leanprover.zulipchat.com",
    "https://github.com/leanprover-community/mathlib"
];

// flow control variables
var isOn          = false;
var urlMatches    = null;
var matchRegex    = null;
var abbreviations = null;
var lastCtrlAt    = 0;

// todo: how to add the right amount of listeners?
const inputs = document.querySelectorAll("div");

function setIsOn(value) {
    isOn = value;
    chrome.runtime.sendMessage({
        type: SET_ICON_PATH,
        data : isOn? ON_ICON_PATH : OFF_ICON_PATH
    });
}

function getOrFail(obj, key) {
    if (!(key in obj)) {
        throw 0;
    }
    return obj[key];
}

function handleInputEvent(e) {
    if (!isOn) return;

    const matches = e.target.value.match(matchRegex);
    if (!matches) return;

    for (const match of matches) {
        if (match in abbreviations) {
            e.target.value = e.target.value.replace(
                match,
                abbreviations[match]
            );
        }
    }
}

function setSettings(settings) {
    urlMatches = getOrFail(settings, URL_MATCHES_KEY);
    const escapeChar = getOrFail(settings, ESCAPE_CHAR_KEY);

    var urlMatched = false;
    for (const url of urlMatches) {
        if (document.URL.startsWith(url)) {
            urlMatched = true;
            break;
        }
    }

    for (const input of inputs) {
        input.removeEventListener(INPUT_LISTENER_NAME, handleInputEvent);
    }

    if (!urlMatched) {
        document.onkeydown = null;
        setIsOn(false);
    }
    else {
        setIsOn(getOrFail(settings, IS_ON_KEY) || isOn);

        fetch(chrome.runtime.getURL(ABBREVIATIONS_PATH))
            .then(response => response.json())
            .then(json => {
                abbreviations = {};
                for (const key of Object.keys(json)) {
                    abbreviations[escapeChar + key + " "] = json[key] + " ";
                }
            });
        matchRegex = RegExp((escapeChar === "\\"? "\\\\" : escapeChar) + "((?!\\s).)+\\s", "g");

        document.onkeydown = e => {
            if (e.altKey && urlMatched) {
                const now = Date.now();
                if (now - lastCtrlAt < 500) {
                    setIsOn(!isOn);
                    lastCtrlAt = 0;
                }
                else {
                    lastCtrlAt = now;
                }
            }
        };

        for (const input of inputs) {
            input.addEventListener(INPUT_LISTENER_NAME, handleInput);
        }
    }
}

function setAndPersistSettings(settings) {
    setSettings(settings);
    chrome.runtime.sendMessage({
        type: SET_SETTINGS,
        data: settings
    });
}

chrome.runtime.sendMessage(
    {type: GET_SETTINGS},
    settings => {
        try { setSettings(settings); }
        catch { setAndPersistSettings(DEFAULT_SETTINGS); }
    }
);
