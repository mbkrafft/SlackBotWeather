"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SlackBot = require("slackbots");
const axios_1 = require("axios");
// Initialize bot instance
var bot = new SlackBot({
    // Token is the OAuth & Permissions Bot User OAut Access Token in slack app page
    token: "xoxb-376518721844-376747350002-pDQF79JNIugG2KKVUm5FedPk",
    name: "weatherbot"
});
// Start Handler
bot.on("start", () => {
    const params = {
        icon_emoji: ":cloud:"
    };
    bot.postMessageToChannel("general", "Type '@weatherbot <city>' to make SlackBotWeather give you the city's weather", params);
});
// Error Handler
bot.on("error", err => {
    console.log(err);
});
// Message Handler
bot.on("message", data => {
    if (data.type !== "message") {
        return;
    }
    else if (data.text.includes("<@UB2MZAA02>")) {
        // <@UB2MZAA02> is the bot's id provided by slack
        handleMessage(data.text);
    }
});
// Response to Data - REFACTOR THIS!
function handleMessage(message) {
    // gets the first word after @weatherbot
    // figure out a way to get all city names - like San Fransisco
    var messageToken = message.split(" ")[1];
    if (messageToken == "help") {
        runHelp();
    }
    else if (messageToken == "here") {
        try {
            getUserCity(userCity => {
                runWeatherScript(userCity);
            });
        }
        catch (err) {
            bot.postMessageToChannel("general", "error" + err);
        }
    }
    else {
        runWeatherScript(messageToken);
    }
}
// Show Help Text
function runHelp() {
    const params = {
        icon_emoji: ":question:"
    };
    bot.postMessageToChannel("general", "'Type @weatherbot <city>' to get the city's weather. " +
        "Type '@weatherbot <here>' to get the weather in your current city", params);
}
// Print weather for given city - apixu api
function runWeatherScript(cityName) {
    axios_1.default
        .get("https://api.apixu.com/v1/current.json?key=ef83c84960454362a64212806180606&q=" +
        cityName)
        .then(res => {
        // Build the string we will post
        var cityWeatherString = "The weather in " +
            res.data.location.name +
            " is " +
            res.data.current.condition.text +
            " and the temperature is " +
            res.data.current.temp_c +
            "°C.";
        const params = {
            icon_emoji: ":city_sunset:"
        };
        bot.postMessageToChannel("general", cityWeatherString, params);
    })
        .catch(() => {
        const params = {
            icon_emoji: ":cry:"
        };
        bot.postMessageToChannel("general", "Couldn't find any weather in " +
            cityName +
            ". Try again with another city.", params);
    });
}
// Get users current city - ipinfo.io api
function getUserCity(callback) {
    axios_1.default
        .post("https://ipinfo.io?token=22fe6a508b66a3")
        .then(res => {
        if (res.data.city != null) {
            bot.postMessageToChannel("general", "Your current city: " + res.data.city);
            callback(res.data.city);
        }
        else {
            throw "Couldn't look up city";
        }
    })
        .catch(err => {
        const params = {
            icon_emoji: ":cry:"
        };
        bot.postMessageToChannel("general", "Couldn't find your city", params);
    });
}
