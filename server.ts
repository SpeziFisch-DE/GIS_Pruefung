import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";

export namespace HFUTwitter {
    //Startin server
    console.log("Starting server");

    function startServer(_port: number | string): void {
        let server: Http.Server = Http.createServer();
        server.addListener("request", handleRequest);
        server.addListener("listening", handleListen);
        server.listen(_port);
    }

    let databaseUrl: string = "mongodb+srv://Fabian:Fabian@specificcluster.n4qe3.mongodb.net/Test?retryWrites=true&w=majority";
    let users: Mongo.Collection;
    async function connectToDatabase(_url: string): Promise<void> {
        let options: Mongo.MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
        let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();
        users = mongoClient.db("Test").collection("userdata");
        console.log("Database connected: " + users != undefined);
    }

    let port: number = Number(process.env.PORT);
    if (!port) {
        port = 8100;
    }

    startServer(port);
    connectToDatabase(databaseUrl);
    //finished starting server

    //interfaces
    interface Userdata {
        username: string;
        fieldofstudies: string;
        semester: string;
        password: string;
        tweets: string;
        followingUsers: string[];
    }

    interface ServerResponse {
        task: string;
        succes: boolean;
        username: string;
    }

    interface Tweet {
        username: string;
        text: string;
    }

    interface Follow {
        username: string;
        follow: string;
    }
    //interfaces end

    function handleListen(): void {
        console.log("listening!");
    }

    async function checkSignin(_input: Userdata): Promise<boolean> {
        let user: Userdata = JSON.parse(JSON.stringify(await users.findOne({ "username": _input.username })));
        return (user == undefined);
    }

    async function checkLogin(_input: Userdata): Promise<boolean> {
        let user: Userdata = JSON.parse(JSON.stringify(await users.findOne({ "username": _input.username, "password": _input.password })));
        return (user != undefined);
    }


    async function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");

        let q: Url.UrlWithParsedQuery = Url.parse(_request.url, true);
        let task: string = q.pathname.slice(1, q.pathname.length);
        console.log(task);
        console.log(q.search);
        let jsonString: string = JSON.stringify(q.query); //convert GET-Url to Userdata-Object
        let input: Userdata = JSON.parse(jsonString);
        console.log(input);

        if (task == "signin") {
            let responseText: ServerResponse = { "task": task, "succes": false, "username": input.username };
            if (await checkSignin(input).catch(() => {
                console.log("Check failed!");
            })) {
                input.tweets = "[]";
                input.followingUsers = [input.username];
                users.insertOne(input);
                responseText.succes = true;
            }
            _response.write(JSON.stringify(responseText));
            _response.end();
        }
        if (task == "login") {
            let responseText: ServerResponse = { "task": task, "succes": false, "username": input.username };
            if (await checkLogin(input).catch(() => {
                console.log("Check failed!");
            })) {
                responseText.succes = true;
            }
            _response.write(JSON.stringify(responseText));
            _response.end();
        }
        if (task == "tweet") {
            let tweetingUser: Userdata = await users.findOne({ "username": input.username });
            let allTweets: Tweet[] = JSON.parse(tweetingUser.tweets);
            let newTweet: Tweet = JSON.parse(jsonString);
            console.log(allTweets);
            allTweets.push(newTweet);
            console.log(allTweets);
            tweetingUser.tweets = JSON.stringify(allTweets);
            console.log(tweetingUser.tweets);
            await users.findOneAndReplace({ "username": input.username }, tweetingUser);
            _response.write("tweeted");
            _response.end();
        }
        if (task == "loadtweets") {
            let showingTweets: Tweet[] = [];
            let loadingUser: Userdata = await users.findOne({ "username": input.username });
            console.log(loadingUser);
            for (let i: number = 0; i < loadingUser.followingUsers.length; i++) {
                let follows: Userdata = await users.findOne({ "username": loadingUser.followingUsers[i] });
                let followTweets: Tweet[] = JSON.parse(follows.tweets);
                for (let j: number = 0; j < followTweets.length; j++) {
                    showingTweets.push(followTweets[j]);
                }
            }
            _response.write(JSON.stringify(showingTweets));
            _response.end();
        }
        if (task == "readusers") {
            let usersCollection: Mongo.Cursor = users.find();
            let usersJSONstring: string = JSON.stringify(await usersCollection.toArray());
            let usersJSON: Userdata[] = JSON.parse(usersJSONstring);
            let usersArr: string[] = [];
            for (let i: number = 0; i < usersJSON.length; i++) {
                usersArr.push(usersJSON[i].username);
            }
            console.log(usersJSONstring);
            _response.write(JSON.stringify(usersArr));
            _response.end();
        }
        if (task == "follow") {
            let newFollow: Follow = JSON.parse(jsonString);
            let myUser: Userdata = await users.findOne({ "username": newFollow.username });
            myUser.followingUsers.push(newFollow.follow);
            await users.findOneAndReplace({ "username": newFollow.username }, myUser);
            _response.write("followed");
            _response.end();
        }
        if (task == "unfollow") {
            let newFollow: Follow = JSON.parse(jsonString);
            let myUser: Userdata = await users.findOne({ "username": newFollow.username });
            let followInt: number = myUser.followingUsers.indexOf(newFollow.follow);
            let newFollowArr: string[] = myUser.followingUsers.slice(0, followInt);
            if (myUser.followingUsers.length - 1 > followInt) {
                for (let i: number = followInt + 1; i < myUser.followingUsers.length; i++) {
                    newFollowArr.push(myUser.followingUsers[i]);
                }
            }
            myUser.followingUsers = newFollowArr;
            await users.findOneAndReplace({ "username": newFollow.username }, myUser);
            _response.write("unfollowed");
            _response.end();
        }
        if (task == "checkfollow") {
            let responseText: ServerResponse = { "task": task, "succes": false, "username": input.username };
            let newFollow: Follow = JSON.parse(jsonString);
            let myUser: Userdata = await users.findOne({ "username": newFollow.username });
            responseText.succes = myUser.followingUsers.includes(newFollow.follow);
            _response.write(JSON.stringify(responseText));
            _response.end();
        }
        if (task == "readprofil") {
            let myUser: Userdata = await users.findOne({ "username": input.username });
            _response.write(JSON.stringify(myUser));
            _response.end();
        }
        if (task == "change") {
            let myUser: Userdata = await users.findOne({ "username": input.username });
            myUser.fieldofstudies = input.fieldofstudies;
            myUser.semester = input.semester;
            myUser.password = input.password;
            await users.findOneAndReplace({ "username": input.username }, myUser);
            _response.write("changed");
            _response.end();
        }

    }
}