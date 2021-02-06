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
        let buttonToSignin: HTMLElement = document.getElementById("toSignin");
        buttonToSignin.addEventListener("click", handleToSignin);
        function handleToSignin(_event: Event): void {
            window.open("signin.html", "_self");
        }
    }
    if (getSubpage() == "signin.html") {
        let buttonToLogin: HTMLElement = document.getElementById("toLogin");
        buttonToLogin.addEventListener("click", handleToSignin);
        function handleToSignin(_event: Event): void {
            window.open("index.html", "_self");
        }
    }

    //Sign In Page
    if (getSubpage() == "signin.html") {
        let buttonSignin: HTMLElement = document.getElementById("submit");
        buttonSignin.addEventListener("click", handleToSignin);
        async function handleToSignin(_event: Event): Promise<void> {
            let formData: FormData = new FormData(document.forms[0]);
            let query: URLSearchParams = new URLSearchParams(<any>formData);
            let url: string = "https://hfu-twitter.herokuapp.com";
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
            let url: string = "https://hfu-twitter.herokuapp.com";
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
            let tweet: Tweet[] = [{"text": "", "username": "" }];
            let url: string = "https://hfu-twitter.herokuapp.com";
            url += "/loadtweets" + "?username=" + localStorage.getItem("username");

            await fetch(url).then(async function (response: Response): Promise<void> {
                let jsonTweets: string = "";
                let responseText: string = await response.text();
                console.log(responseText);
                jsonTweets = JSON.stringify(responseText);
                if (jsonTweets != undefined)
                tweet = JSON.parse(jsonTweets);
            }
            );
            return tweet;
        }

        let feedDiv: HTMLElement = document.getElementById("feed");
        async function writeTweets(): Promise<void> {
            let tweets: Tweet[] = await loadTweetJSON();
            for (let i: number = 0; i < tweets.length; i++) {
                let newTweet: HTMLElement = new HTMLDivElement();
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
            let url: string = "https://hfu-twitter.herokuapp.com";
            url += "/tweet" + "?" + "username=" + localStorage.getItem("username") + query.toString();

            await fetch(url).then(async function (response: Response): Promise<void> {
                let responseText: string = await response.text();
                console.log(responseText);
                let responseObj: ServerResponse = JSON.parse(responseText);
                if (responseObj.task == "tweet" && responseObj.succes) {
                    console.log("tweeted");
                }
            }
            );
        }
    }
}