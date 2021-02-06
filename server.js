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
    if (!port)
        port = 8100;
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
            _response.write(["SpeziFischDE"]);
            _response.end();
        }
    }
})(HFUTwitter = exports.HFUTwitter || (exports.HFUTwitter = {}));
/*
export namespace P_3_1Server {
    console.log("Starting server");

    interface MyInput { //every possible input
        Name: string;
        Nachname: string;
        email: string;
        Adresse: string;
        Passwort: string;
        task: string;
    }

    interface User { //user input from registration-Page
        Name: string;
        Nachname: string;
        email: string;
        Adresse: string;
        Passwort: string;
    }

    function inputUser(_input: MyInput): User { //converting Input to Registration-Input
        let myUser: User = { "Name": "", "Nachname": "", "Adresse": "", "email": "", "Passwort": "" };
        myUser.Name = _input.Name;
        myUser.Nachname = _input.Nachname;
        myUser.email = _input.email;
        myUser.Adresse = _input.Adresse;
        myUser.Passwort = _input.Passwort;
        return myUser;
    }

    let users: Mongo.Collection;

    let port: number = Number(process.env.PORT);
    if (!port)
        port = 8100;

    let databaseUrl: string = "mongodb+srv://Fabian:Fabian@specificcluster.n4qe3.mongodb.net/Test?retryWrites=true&w=majority";

    startServer(port);
    connectToDatabase(databaseUrl);

    function startServer(_port: number | string): void {
        let server: Http.Server = Http.createServer();
        server.addListener("request", handleRequest);
        server.addListener("listening", handleListen);
        server.listen(_port);
    }

    async function connectToDatabase(_url: string): Promise<void> {
        let options: Mongo.MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
        let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();
        users = mongoClient.db("Test").collection("users");
        console.log("Database connected: " + users != undefined);
    }

    function storeUser(_user: User): void {
        users.insertOne(_user);
    }

    function handleListen(): void {
        console.log("Listening");
    }

    async function checkUser(_user: User): Promise<boolean> { //is email already used in Database?
        let newUser: User = JSON.parse(JSON.stringify(await users.findOne({ "email": _user.email })));
        return _user.email == newUser.email;
    }
    async function checkPassword(_user: MyInput): Promise<boolean> { //is user / password correct
        let newUser: User = JSON.parse(JSON.stringify(await users.findOne({ "Passwort": _user.Passwort, "email": _user.email })));
        return newUser != undefined;
    }
    async function getUsers(): Promise<string> { // return every user in Database
        let returnString: string = "";

        let userCurser: Mongo.Cursor = users.find();
        let jsonUsers: string = JSON.stringify(await userCurser.toArray());
        let myUsers: User[] = JSON.parse(jsonUsers);
        for (let i: number = 0; i < myUsers.length; i++) {
            returnString = returnString + "<p>" + myUsers[i].Name + " " + myUsers[i].Nachname + "</p></br>";
        }
        return returnString;
    }


    async function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
        console.log("I hear voices!");
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");

        let q: Url.UrlWithParsedQuery = Url.parse(_request.url, true);
        console.log(q.search);

        let jsonString: string = JSON.stringify(q.query); //convert GET-Url to Input-Object
        let input: MyInput = JSON.parse(jsonString);

        if (input.task == "register") { // for requested registration
            let user: User = inputUser(input);
            if (!(await checkUser(user).catch(() => {
                console.log("Check failed!");
            }))) {
                storeUser(user);
                _response.write("user created!");
                _response.end();
            } else {
                _response.write("user already exists!");
                _response.end();
            }

        } else if (input.task == "showusers") { // for requested users
            let responseString: string | void;
            responseString = await getUsers().catch(() => {
                console.log("failed!");
            });
            _response.write("" + responseString)
            _response.end();

        } else if (input.task == "signin") { // for requested sign in
            if ((await checkPassword(input).catch(() => {
                console.log("Sign in failed!");
            }))) {
                _response.write("Sign in sucessful!");
                _response.end();
            } else {
                _response.write("Sign in unsucessful!");
                _response.end();
            }
        } else {
            _response.write("something went wrong!");
            _response.end();
        }
    }
}
    */ 
//# sourceMappingURL=server.js.map