"use strict";
var HFUTwitter;
(function (HFUTwitter) {
    function getSubpage() {
        return window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    }
    //navigation
    if (getSubpage() == "index.html") {
        localStorage.clear();
        let buttonToSignin = document.getElementById("toSignin");
        buttonToSignin.addEventListener("click", handleToSignin);
        function handleToSignin(_event) {
            window.open("signin.html", "_self");
        }
    }
    if (getSubpage() == "signin.html") {
        localStorage.clear();
        let buttonToLogin = document.getElementById("toLogin");
        buttonToLogin.addEventListener("click", handleToSignin);
        function handleToSignin(_event) {
            window.open("index.html", "_self");
        }
    }
    //Sign In Page
    if (getSubpage() == "signin.html") {
        let buttonSignin = document.getElementById("submit");
        buttonSignin.addEventListener("click", handleToSignin);
        async function handleToSignin(_event) {
            let formData = new FormData(document.forms[0]);
            let query = new URLSearchParams(formData);
            let url = "https://hfu-twitter.herokuapp.com";
            url += "/signin" + "?" + query.toString();
            await fetch(url).then(async function (response) {
                let responseText = await response.text();
                console.log(responseText);
                let responseObj = JSON.parse(responseText);
                if (responseObj.task == "signin" && responseObj.succes) {
                    localStorage.setItem("username", responseObj.username);
                    window.open("follow.html", "_self");
                }
            });
        }
    }
    //Login Page
    if (getSubpage() == "index.html") {
        let buttonSignin = document.getElementById("submit");
        buttonSignin.addEventListener("click", handleLogin);
        async function handleLogin(_event) {
            let formData = new FormData(document.forms[0]);
            let query = new URLSearchParams(formData);
            let url = "https://hfu-twitter.herokuapp.com";
            url += "/login" + "?" + query.toString();
            await fetch(url).then(async function (response) {
                let responseText = await response.text();
                console.log(responseText);
                let responseObj = JSON.parse(responseText);
                if (responseObj.task == "login" && responseObj.succes) {
                    localStorage.setItem("username", responseObj.username);
                    window.open("feed.html", "_self");
                }
            });
        }
    }
    //feed
    if (getSubpage() == "feed.html") {
        async function loadTweetJSON() {
            //{"text": "", "username": "" }
            let tweet = [];
            let url = "https://hfu-twitter.herokuapp.com";
            url += "/loadtweets" + "?username=" + localStorage.getItem("username");
            await fetch(url).then(async function (response) {
                let jsonTweets = "";
                let responseText = await response.text();
                console.log(responseText);
                jsonTweets = JSON.stringify(responseText);
                if (jsonTweets != undefined)
                    tweet = JSON.parse(jsonTweets);
            });
            return tweet;
        }
        let feedDiv = document.getElementById("feed");
        async function writeTweets() {
            let tweets = await loadTweetJSON();
            for (let i = 0; i < tweets.length; i++) {
                let newTweet = document.createElement("div");
                newTweet.setAttribute("id", "tweet");
                newTweet.innerHTML = "<h2>" + tweets[i].username + "</h2><p>" + tweets[i].text + "</p>";
                feedDiv.appendChild(newTweet);
            }
        }
        writeTweets();
        let buttonTweet = document.getElementById("tweet");
        buttonTweet.addEventListener("click", handleLogin);
        async function handleLogin(_event) {
            let formData = new FormData(document.forms[0]);
            let query = new URLSearchParams(formData);
            let url = "https://hfu-twitter.herokuapp.com";
            url += "/tweet" + "?" + "username=" + localStorage.getItem("username") + "&" + query.toString();
            await fetch(url).then(async function (response) {
                let responseText = await response.text();
                console.log(responseText);
            });
        }
    }
})(HFUTwitter || (HFUTwitter = {}));
//# sourceMappingURL=script.js.map