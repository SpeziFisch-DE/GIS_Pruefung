"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HFUTwitter = void 0;
const Http = require("http");
const Url = require("url");
const Mongo = require("mongodb");
var HFUTwitter;
(function (HFUTwitter) {
    //Startin server
    console.log("Starting server");
    function startServer(_port) {
        let server = Http.createServer();
        server.addListener("request", handleRequest);
        server.addListener("listening", handleListen);
        server.listen(_port);
    }
    let databaseUrl = "mongodb+srv://Fabian:Fabian@specificcluster.n4qe3.mongodb.net/Test?retryWrites=true&w=majority";
    let users;
    async function connectToDatabase(_url) {
        let options = { useNewUrlParser: true, useUnifiedTopology: true };
        let mongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();
        users = mongoClient.db("Test").collection("userdata");
        console.log("Database connected: " + users != undefined);
    }
    let port = Number(process.env.PORT);
    if (!port) {
        port = 8100;
    }
    startServer(port);
    connectToDatabase(databaseUrl);
    //interfaces end
    function handleListen() {
        console.log("listening!");
    }
    async function checkSignin(_input) {
        let user = JSON.parse(JSON.stringify(await users.findOne({ "username": _input.username })));
        return (user == undefined);
    }
    async function checkLogin(_input) {
        let user = JSON.parse(JSON.stringify(await users.findOne({ "username": _input.username, "password": _input.password })));
        return (user != undefined);
    }
    async function handleRequest(_request, _response) {
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");
        let q = Url.parse(_request.url, true);
        let task = q.pathname.slice(1, q.pathname.length);
        console.log(task);
        console.log(q.search);
        let jsonString = JSON.stringify(q.query); //convert GET-Url to Userdata-Object
        let input = JSON.parse(jsonString);
        console.log(input);
        if (task == "signin") {
            let responseText = { "task": task, "succes": false, "username": input.username };
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
            let responseText = { "task": task, "succes": false, "username": input.username };
            if (await checkLogin(input).catch(() => {
                console.log("Check failed!");
            })) {
                responseText.succes = true;
            }
            _response.write(JSON.stringify(responseText));
            _response.end();
        }
        if (task == "tweet") {
            let tweetingUser = await users.findOne({ "username": input.username });
            let allTweets = JSON.parse(tweetingUser.tweets);
            let newTweet = JSON.parse(jsonString);
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
            let showingTweets = [];
            let loadingUser = await users.findOne({ "username": input.username });
            console.log(loadingUser);
            for (let i = 0; i < loadingUser.followingUsers.length; i++) {
                let follows = await users.findOne({ "username": loadingUser.followingUsers[i] });
                let followTweets = JSON.parse(follows.tweets);
                for (let j = 0; j < followTweets.length; j++) {
                    showingTweets.push(followTweets[j]);
                }
            }
            _response.write(JSON.stringify(showingTweets));
            _response.end();
        }
        if (task == "readusers") {
            let usersCollection = users.find();
            let usersJSONstring = JSON.stringify(await usersCollection.toArray());
            let usersJSON = JSON.parse(usersJSONstring);
            let usersArr = [];
            for (let i = 0; i < usersJSON.length; i++) {
                usersArr.push(usersJSON[i].username);
            }
            console.log(usersJSONstring);
            _response.write(JSON.stringify(usersArr));
            _response.end();
        }
        if (task == "follow") {
            let newFollow = JSON.parse(jsonString);
            let myUser = await users.findOne({ "username": newFollow.username });
            myUser.followingUsers.push(newFollow.follow);
            await users.findOneAndReplace({ "username": newFollow.username }, myUser);
            _response.write("followed");
            _response.end();
        }
        if (task == "unfollow") {
            let newFollow = JSON.parse(jsonString);
            let myUser = await users.findOne({ "username": newFollow.username });
            let followInt = myUser.followingUsers.indexOf(newFollow.follow);
            let newFollowArr = myUser.followingUsers.slice(0, followInt);
            if (myUser.followingUsers.length - 1 > followInt) {
                for (let i = followInt + 1; i < myUser.followingUsers.length; i++) {
                    newFollowArr.push(myUser.followingUsers[i]);
                }
            }
            myUser.followingUsers = newFollowArr;
            await users.findOneAndReplace({ "username": newFollow.username }, myUser);
            _response.write("unfollowed");
            _response.end();
        }
        if (task == "checkfollow") {
            let responseText = { "task": task, "succes": false, "username": input.username };
            let newFollow = JSON.parse(jsonString);
            let myUser = await users.findOne({ "username": newFollow.username });
            responseText.succes = myUser.followingUsers.includes(newFollow.follow);
            _response.write(JSON.stringify(responseText));
            _response.end();
        }
        if (task == "readprofil") {
            let myUser = await users.findOne({ "username": input.username });
            _response.write(JSON.stringify(myUser));
            _response.end();
        }
        if (task == "change") {
            let myUser = await users.findOne({ "username": input.username });
            myUser.fieldofstudies = input.fieldofstudies;
            myUser.semester = input.semester;
            myUser.password = input.password;
            await users.findOneAndReplace({ "username": input.username }, myUser);
            _response.write("changed");
            _response.end();
        }
    }
})(HFUTwitter = exports.HFUTwitter || (exports.HFUTwitter = {}));
//# sourceMappingURL=server.js.map