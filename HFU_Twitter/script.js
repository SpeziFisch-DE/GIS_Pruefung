"use strict";
var HFUTwitter;
(function (HFUTwitter) {
    function getSubpage() {
        return window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    }
    //navigation
    if (getSubpage() == "index.html") {
        let buttonToSignin = document.getElementById("toSignin");
        buttonToSignin.addEventListener("click", handleToSignin);
        function handleToSignin(_event) {
            window.open("signin.html", "_self");
        }
    }
    if (getSubpage() == "signin.html") {
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
            await fetch(url);
        }
    }
})(HFUTwitter || (HFUTwitter = {}));
//# sourceMappingURL=script.js.map