/*
Copyright (c) 2022 Arthur Paulino. All rights reserved.
Released under Apache 2.0 license as described in the file LICENSE.
Author: Arthur Paulino
*/

var escapeChar = null;
var isOn = null;
var matchRegex = null;

function setIsOn(value) {
    isOn = value;
    chrome.runtime.sendMessage({
        type: "setIconPath",
        data : isOn? "on.png" : "off.png"
    });
}

function setAndPersistSettings(settings) {
    setIsOn(settings.isOn);
    escapeChar = settings.escapeChar;
    matchRegex = RegExp(
        escapeChar + (escapeChar === "\\"? "\\((?!\\s).)+\\s" : "((?!\\s).)+\\s"),
        "g"
    );
    chrome.runtime.sendMessage({
        type: "setSettings",
        data: settings
    });
}

chrome.runtime.sendMessage({type: "getSettings"}, response => {
    try {
        isOn = response.isOn;
        escapeChar = response.escapeChar;
    }
    catch {
        isOn = true;
        escapeChar = "\\";
    }
    finally{
        setAndPersistSettings({
            isOn: isOn,
            escapeChar: escapeChar
        });
    }
});

fetch(chrome.runtime.getURL("abbreviations.json"))
    .then(response => response.json())
    .then(json => {
        for (const key of Object.keys(json)) {
            abbreviations[escapeChar + key + " "] = json[key] + " ";
        }
        abbreviationsKeys = Object.keys(abbreviations);
    });
    
var abbreviations = {};
var abbreviationsKeys = []

function transform(str) {
    const matches = str.match(matchRegex);
    if (!matches) return str;
    for (match of matches) {
        if (abbreviationsKeys.includes(match)) {
            str = str.replace(match, abbreviations[match]);
        }
    }
    return str;
}

var lastCtrlAt = 0;

document.onkeydown = (evt) => {
    if (evt.altKey) {
        const now = Date.now();
        if (now - lastCtrlAt < 500) {
            setIsOn(!isOn);
        }
        lastCtrlAt = now;
    }
};

// todo: how to add the right amount of listeners?
const inputs = document.querySelectorAll("div");

for (const input of inputs) {
    input.addEventListener("input", (evt) => {
        if (isOn) {
            evt.target.value = transform(evt.target.value);
        }
    });
}
