namespace HFUTwitter {

    interface Tweet {
        username: string;
        text: string;
    }
    interface ServerResponse {
        task: string;
        succes: boolean;
        username: string;
    }

    function getSubpage(): string {
        return window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    }

    //navigation
    if (getSubpage() == "index.html") {
        localStorage.clear();
        let buttonToSignin: HTMLElement = document.getElementById("toSignin");
        buttonToSignin.addEventListener("click", handleToSignin);
        function handleToSignin(_event: Event): void {
            window.open("signin.html", "_self");
        }
    }
    if (getSubpage() == "signin.html") {
        localStorage.clear();
        let buttonToLogin: HTMLElement = document.getElementById("toLogin");
        buttonToLogin.addEventListener("click", handleToSignin);
        function handleToSignin(_event: Event): void {
            window.open("index.html", "_self");
        }
    }

    let serverURL: string = "https://hfu-twitter.herokuapp.com";

    //Sign In Page
    if (getSubpage() == "signin.html") {
        let buttonSignin: HTMLElement = document.getElementById("submit");
        buttonSignin.addEventListener("click", handleToSignin);
        async function handleToSignin(_event: Event): Promise<void> {
            let formData: FormData = new FormData(document.forms[0]);
            let query: URLSearchParams = new URLSearchParams(<any>formData);
            let url: string = serverURL;
            url += "/signin" + "?" + query.toString();

            await fetch(url).then(async function (response: Response): Promise<void> {
                let responseText: string = await response.text();
                console.log(responseText);
                let responseObj: ServerResponse = JSON.parse(responseText);
                if (responseObj.task == "signin" && responseObj.succes) {
                    localStorage.setItem("username", responseObj.username);
                    window.open("follow.html", "_self");
                }
            }
            );
        }
    }
    //Login Page
    if (getSubpage() == "index.html") {
        let buttonSignin: HTMLElement = document.getElementById("submit");
        buttonSignin.addEventListener("click", handleLogin);
        async function handleLogin(_event: Event): Promise<void> {
            let formData: FormData = new FormData(document.forms[0]);
            let query: URLSearchParams = new URLSearchParams(<any>formData);
            let url: string = serverURL;
            url += "/login" + "?" + query.toString();

            await fetch(url).then(async function (response: Response): Promise<void> {
                let responseText: string = await response.text();
                console.log(responseText);
                let responseObj: ServerResponse = JSON.parse(responseText);
                if (responseObj.task == "login" && responseObj.succes) {
                    localStorage.setItem("username", responseObj.username);
                    window.open("feed.html", "_self");
                }
            }
            );
        }
    }
    //feed
    if (getSubpage() == "feed.html") {
        async function loadTweetJSON(): Promise<Tweet[]> {
            let tweet: Tweet[] = [];
            let url: string = serverURL;
            url += "/loadtweets" + "?username=" + localStorage.getItem("username");

            await fetch(url).then(async function (response: Response): Promise<void> {
                let responseText: string = await response.text();
                console.log(responseText);
                tweet = JSON.parse(responseText);
            }
            );
            return tweet;
        }

        let feedDiv: HTMLElement = document.getElementById("feed");
        async function writeTweets(): Promise<void> {
            let tweets: Tweet[] = await loadTweetJSON();
            for (let i: number = 0; i < tweets.length; i++) {
                let newTweet: HTMLElement = document.createElement("div");
                newTweet.setAttribute("id", "tweet");
                newTweet.innerHTML = "<h2>" + tweets[i].username + "</h2><p>" + tweets[i].text + "</p>";
                feedDiv.appendChild(newTweet);
            }
        }
        writeTweets();

        let buttonTweet: HTMLElement = document.getElementById("tweet");
        buttonTweet.addEventListener("click", handleLogin);
        async function handleLogin(_event: Event): Promise<void> {
            let formData: FormData = new FormData(document.forms[0]);
            let query: URLSearchParams = new URLSearchParams(<any>formData);
            let url: string = serverURL;
            url += "/tweet" + "?" + "username=" + localStorage.getItem("username") + "&" + query.toString();

            await fetch(url).then(async function (response: Response): Promise<void> {
                let responseText: string = await response.text();
                console.log(responseText);
                window.open("feed.html", "_self");
            }
            );
        }
    }
    if (getSubpage() == "follow.html") {
        let followDiv: HTMLElement = document.getElementById("follow");

        async function getAllUsers(): Promise<string[]> {
            let usersJSON: string[] = [];
            let url: string = serverURL;
            url += "/readusers";

            await fetch(url).then(async function (response: Response): Promise<void> {
                let responseText: string = await response.text();
                usersJSON = JSON.parse(responseText);
            });
            return usersJSON;
        }
        async function writeUsers(): Promise<void> {
            let users: string[] = <string[]>await getAllUsers().catch(() => {
                console.log("Check failed!");
            });
            for (let i: number = 0; users.length; i++) {
                let newUserDiv: HTMLDivElement = document.createElement("div");
                newUserDiv.setAttribute("class", "user");
                let userName: HTMLElement = document.createElement("p");
                userName.innerHTML = users[i];
                let followUser: HTMLButtonElement = document.createElement("button");
                followUser.setAttribute("type", "button");
                followUser.setAttribute("name", users[i]);
                followUser.innerText = "follow";
                newUserDiv.appendChild(userName);
                newUserDiv.appendChild(followUser);
                followDiv.appendChild(newUserDiv);
            }
        }
        writeUsers();
    }
}