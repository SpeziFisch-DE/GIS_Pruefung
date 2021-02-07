namespace HFUTwitter {

    interface Userdata {
        username: string;
        fieldofstudies: string;
        semester: string;
        password: string;
        tweets: string;
        followingUsers: string[];
    }

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
            if ((query.get("username").length > 3) && (query.get("fieldofstudies").length > 1) && (query.get("semester").length > 0) && (query.get("password").length > 3)) {
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
            } else {
                console.log("entries not valid");
                let errorP: HTMLElement = document.getElementById("error");
                errorP.innerText = "entries not valid";
            }
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
            if ((query.get("username").length > 3 && (query.get("password").length > 3))) {
                url += "/login" + "?" + query.toString();

                await fetch(url).then(async function (response: Response): Promise<void> {
                    let responseText: string = await response.text();
                    console.log(responseText);
                    let responseObj: ServerResponse = JSON.parse(responseText);
                    if (responseObj.task == "login" && responseObj.succes) {
                        localStorage.setItem("username", responseObj.username);
                        window.open("feed.html", "_self");
                    } else {
                        console.log("wrong username and/or password");
                        let errorP: HTMLElement = document.getElementById("error");
                        errorP.innerText = "wrong username and/or password";
                    }
                }
                );
            } else {
                console.log("entries not valid");
                let errorP: HTMLElement = document.getElementById("error");
                errorP.innerText = "entries not valid";
            }
        }
    }
    //feed
    if (getSubpage() == "feed.html") {
        if (localStorage.getItem("username") == undefined) {
            window.open("index.html", "_self");
        }
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
                newTweet.setAttribute("class", "tweet");
                newTweet.innerHTML = "<h2>" + tweets[i].username + "</h2><p>" + tweets[i].text + "</p>";
                feedDiv.appendChild(newTweet);
            }
        }
        writeTweets();

        let tweetBox: HTMLElement = document.getElementById("text");
        let letterCount: HTMLElement = document.getElementById("letters");
        tweetBox.addEventListener("input", handleWriting);
        function handleWriting (_event: Event): void {
            let eventBox: HTMLTextAreaElement = <HTMLTextAreaElement>_event.currentTarget;
            letterCount.innerText = eventBox.value.length + "/80 letters";
        }
        let buttonTweet: HTMLElement = document.getElementById("tweet");
        buttonTweet.addEventListener("click", handleLogin);
        async function handleLogin(_event: Event): Promise<void> {
            let formData: FormData = new FormData(document.forms[0]);
            let query: URLSearchParams = new URLSearchParams(<any>formData);
            let url: string = serverURL;
            if ((0 < query.get("text").length) && (query.get("text").length < 81)) {
                url += "/tweet" + "?" + "username=" + localStorage.getItem("username") + "&" + query.toString();

                await fetch(url).then(async function (response: Response): Promise<void> {
                    let responseText: string = await response.text();
                    console.log(responseText);
                    window.open("feed.html", "_self");
                }
                );
            } else {
                console.log("tweet is too long or contains no letters!");
                let errorP: HTMLElement = document.getElementById("error");
                errorP.innerText = "tweet is too long or contains no letters!";
            }
        }
    }
    if (getSubpage() == "follow.html") {
        if (localStorage.getItem("username") == undefined) {
            window.open("index.html", "_self");
        }
        let followDiv: HTMLElement = document.getElementById("follow");

        async function getAllUsers(): Promise<string> {
            let usersJSON: string[] = [];
            let url: string = serverURL;
            url += "/readusers";

            await fetch(url).then(async function (response: Response): Promise<void> {
                let responseText: string = await response.text();
                usersJSON = JSON.parse(responseText);
            });
            console.log(usersJSON);
            return JSON.stringify(usersJSON);
        }
        async function writeUsers(): Promise<void> {
            let writeUser: string[] = [];
            let jsonUsers: string | void = await getAllUsers().catch(() => {
                console.log("Check failed!");
            });
            writeUser = JSON.parse(<string>jsonUsers);
            console.log(writeUser);
            for (let i: number = 0; i < writeUser.length; i++) {
                let newUserDiv: HTMLDivElement = document.createElement("div");
                newUserDiv.setAttribute("class", "user");
                followDiv.appendChild(newUserDiv);
                let userName: HTMLElement = document.createElement("p");
                userName.innerHTML = writeUser[i];
                newUserDiv.appendChild(userName);
                let followUser: HTMLButtonElement = document.createElement("button");
                followUser.setAttribute("type", "button");
                followUser.setAttribute("name", writeUser[i]);
                async function checkFollow(_checkUser: string): Promise<boolean> {
                    let url: string = serverURL;
                    url += "/checkfollow" + "?username=" + localStorage.getItem("username") + "&follow=" + _checkUser;
                    console.log(url);
                    let check: boolean = false;
                    await fetch(url).then(async function (response: Response): Promise<void> {
                        let responseText: string = await response.text();
                        console.log(responseText);
                        let responseObj: ServerResponse = JSON.parse(responseText);
                        check = !responseObj.succes;
                    });
                    return check;
                }
                if (await checkFollow(writeUser[i]).catch(() => {
                    console.log("Check failed!");
                })) {
                    followUser.innerText = "follow";
                } else {
                    followUser.innerText = "unfollow";
                }

                followUser.addEventListener("click", handleFollow);
                async function handleFollow(_event: Event): Promise<void> {
                    let followButton: HTMLButtonElement = <HTMLButtonElement>_event.target;
                    let url: string = serverURL;
                    url += "/" + followUser.innerText + "?username=" + localStorage.getItem("username") + "&follow=" + followButton.name;
                    console.log(url);
                    await fetch(url).then(async function (response: Response): Promise<void> {
                        let responseText: string = await response.text();
                        console.log(responseText);
                        if (followButton.innerText == "follow") { followButton.innerText = "unfollow"; }
                        else if (followButton.innerText == "unfollow") { followButton.innerText = "follow"; }
                    });
                }
                newUserDiv.appendChild(followUser);
            }
        }
        writeUsers();
    }
    if (getSubpage() == "profil.html") {
        let usernameEl: HTMLElement = document.getElementById("username")
        let fieldofstudiesEl: HTMLElement = document.getElementById("fieldofstudies");
        let semesterEl: HTMLElement = document.getElementById("semester");
        let passwordEl: HTMLElement = document.getElementById("password");
        async function readProfil(): Promise<void> {
            let url: string = serverURL;
            url += "/readprofil?username=" + localStorage.getItem("username");
            console.log(url);
            await fetch(url).then(async function (response: Response): Promise<void> {
                let responseText: string = await response.text();
                console.log(responseText);
                let myUser: Userdata = JSON.parse(responseText);
                usernameEl.innerText = myUser.username;
                fieldofstudiesEl.setAttribute("value", myUser.fieldofstudies);
                semesterEl.setAttribute("value", myUser.semester);
                passwordEl.setAttribute("value", myUser.password);
            });
        }
        readProfil();
        let changesButton: HTMLElement = document.getElementById("save");
        changesButton.addEventListener("click", handleChanges);
        async function handleChanges(_event: Event): Promise<void> {
            let formData: FormData = new FormData(document.forms[0]);
            let query: URLSearchParams = new URLSearchParams(<any>formData);
            let url: string = serverURL;
            url += "/change?username=" + localStorage.getItem("username") + "&" + query.toString();
            console.log(url);
            if ((query.get("fieldofstudies").length > 1) && (query.get("semester").length > 0) && (query.get("password").length > 3)) {
                await fetch(url).then(async function (response: Response): Promise<void> {
                    let responseText: string = await response.text();
                    console.log(responseText);
                });
            } else {
                console.log("entries not valid");
                let errorP: HTMLElement = document.getElementById("error");
                errorP.innerText = "entries not valid";
            }
        }
    }
}