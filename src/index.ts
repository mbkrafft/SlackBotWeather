import * as SlackBot from "slackbots";
import axios from "axios";

// Initialize bot instance
var bot = new SlackBot({
    // Token is the OAuth & Permissions Bot User OAut Access Token in slack app page
    // Remember to replace <your-token> with your own slack token
    token: "<your-token>",
    name: "weatherbot"
});

// Start Handler
bot.on("start", () => {
    const params = {
        icon_emoji: ":cloud:"
    };

    bot.postMessageToChannel(
        "general",
        "Type '@weatherbot <city>' to make SlackBotWeather give you the city's weather",
        params
    );
});

// Error Handler
bot.on("error", err => {
    console.log(err);
});

// Message Handler
bot.on("message", data => {
    if (data.type !== "message") {
        return;
    } else if (data.text.includes("@<bot-id>")) {
        // Remember to replace <bot-id> with your own bot id
        handleMessage(data.text);
    }
});

// Response to Data
function handleMessage(message: String): void {
    var messageToken = message.split(" ")[1];

    if (messageToken == "help") {
        runHelp();
    } else if (messageToken == "here") {
        try {
            getUserCity(userCity => {
                runWeatherScript(userCity);
            });
        } catch (err) {
            bot.postMessageToChannel("general", "error" + err);
        }
    } else {
        runWeatherScript(messageToken);
    }
}

// Show Help Text
function runHelp(): void {
    const params = {
        icon_emoji: ":question:"
    };

    bot.postMessageToChannel(
        "general",
        "'Type @weatherbot <city>' to get the city's weather. " +
            "Type '@weatherbot <here>' to get the weather in your current city. " +
            "If @weatherbot does not find the given city, it will try to match the closest " +
            "thing it can find and give an answer based on that. " +
            "This bot currently only works with single worded city queries. ",
        params
    );
}

// Print Weather for Given City - apixu api
function runWeatherScript(cityName: string): void {
    // Remember to replace <YOUR-KEY> with your own key
    axios
        .get(
            "https://api.apixu.com/v1/current.json?key=<YOUR-KEY>q=" + cityName
        )
        .then(res => {
            var cityWeatherString =
                "The weather in " +
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
            bot.postMessageToChannel(
                "general",
                "Couldn't find any weather in " +
                    cityName +
                    ". Try again with another city.",
                params
            );
        });
}

// Get Users Current City - ipinfo.io api
function getUserCity(callback) {
    // Remember to replace <YOUR-TOKEN> with your own token
    axios
        .post("https://ipinfo.io?token=<YOUR-TOKEN>")
        .then(res => {
            if (res.data.city != null) {
                bot.postMessageToChannel(
                    "general",
                    "Your current city: " + res.data.city
                );
                callback(res.data.city);
            } else {
                throw "Couldn't look up city";
            }
        })
        .catch(err => {
            const params = {
                icon_emoji: ":cry:"
            };
            bot.postMessageToChannel(
                "general",
                "Couldn't find your city",
                params
            );
        });
}
