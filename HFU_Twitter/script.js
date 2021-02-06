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
    let serverURL = "https://hfu-twitter.herokuapp.com";
    //Sign In Page
    if (getSubpage() == "signin.html") {
        let buttonSignin = document.getElementById("submit");
        buttonSignin.addEventListener("click", handleToSignin);
        async function handleToSignin(_event) {
            let formData = new FormData(document.forms[0]);
            let query = new URLSearchParams(formData);
            let url = serverURL;
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
            let url = serverURL;
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
            let tweet = [];
            let url = serverURL;
            url += "/loadtweets" + "?username=" + localStorage.getItem("username");
            await fetch(url).then(async function (response) {
                let responseText = await response.text();
                console.log(responseText);
                tweet = JSON.parse(responseText);
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
            let url = serverURL;
            url += "/tweet" + "?" + "username=" + localStorage.getItem("username") + "&" + query.toString();
            await fetch(url).then(async function (response) {
                let responseText = await response.text();
                console.log(responseText);
                window.open("feed.html", "_self");
            });
        }
    }
    if (getSubpage() == "follow.html") {
        let followDiv = document.getElementById("follow");
        async function getAllUsers() {
            let usersJSON = [];
            let url = serverURL;
            url += "/readusers";
            await fetch(url).then(async function (response) {
                let responseText = await response.text();
                usersJSON = JSON.parse(responseText);
            });
            console.log(usersJSON);
            return JSON.stringify(usersJSON);
        }
        async function writeUsers() {
            let writeUser = [];
            let jsonUsers = await getAllUsers().catch(() => {
                console.log("Check failed!");
            });
            writeUser = JSON.parse(jsonUsers);
            console.log(writeUser);
            for (let i = 0; i < writeUser.length; i++) {
                let newUserDiv = document.createElement("div");
                newUserDiv.setAttribute("class", "user");
                followDiv.appendChild(newUserDiv);
                let userName = document.createElement("p");
                userName.innerHTML = writeUser[i];
                newUserDiv.appendChild(userName);
                let followUser = document.createElement("button");
                followUser.setAttribute("type", "button");
                followUser.setAttribute("name", writeUser[i]);
                followUser.innerText = "follow";
                followUser.addEventListener("click", handleFollow);
                async function handleFollow(_event) {
                    let followButton = _event.target;
                    let url = serverURL;
                    url += "/" + followUser.innerText + "?username=" + localStorage.getItem("username") + "&follow=" + followButton.name;
                    console.log(url);
                    await fetch(url).then(async function (response) {
                        let responseText = await response.text();
                        console.log(responseText);
                        followButton.innerText = ((followButton.innerText == "follow") ? "unfollow" : "follow");
                    });
                }
                newUserDiv.appendChild(followUser);
            }
        }
        writeUsers();
    }
})(HFUTwitter || (HFUTwitter = {}));
//# sourceMappingURL=script.js.map