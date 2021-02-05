"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.P_3_1Server = void 0;
const Http = require("http");
const Url = require("url");
const Mongo = require("mongodb");
var P_3_1Server;
(function (P_3_1Server) {
    console.log("Starting server");
    function inputUser(_input) {
        let myUser = { "Name": "", "Nachname": "", "Adresse": "", "email": "", "Passwort": "" };
        myUser.Name = _input.Name;
        myUser.Nachname = _input.Nachname;
        myUser.email = _input.email;
        myUser.Adresse = _input.Adresse;
        myUser.Passwort = _input.Passwort;
        return myUser;
    }
    let users;
    let port = Number(process.env.PORT);
    if (!port)
        port = 8100;
    let databaseUrl = "mongodb+srv://Fabian:Fabian@specificcluster.n4qe3.mongodb.net/Test?retryWrites=true&w=majority";
    startServer(port);
    connectToDatabase(databaseUrl);
    function startServer(_port) {
        let server = Http.createServer();
        server.addListener("request", handleRequest);
        server.addListener("listening", handleListen);
        server.listen(_port);
    }
    async function connectToDatabase(_url) {
        let options = { useNewUrlParser: true, useUnifiedTopology: true };
        let mongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();
        users = mongoClient.db("Test").collection("users");
        console.log("Database connected: " + users != undefined);
    }
    function storeUser(_user) {
        users.insertOne(_user);
    }
    function handleListen() {
        console.log("Listening");
    }
    async function checkUser(_user) {
        let newUser = JSON.parse(JSON.stringify(await users.findOne({ "email": _user.email })));
        return _user.email == newUser.email;
    }
    async function checkPassword(_user) {
        let newUser = JSON.parse(JSON.stringify(await users.findOne({ "Passwort": _user.Passwort, "email": _user.email })));
        return newUser != undefined;
    }
    async function getUsers() {
        let returnString = "";
        let userCurser = users.find();
        let jsonUsers = JSON.stringify(await userCurser.toArray());
        let myUsers = JSON.parse(jsonUsers);
        for (let i = 0; i < myUsers.length; i++) {
            returnString = returnString + "<p>" + myUsers[i].Name + " " + myUsers[i].Nachname + "</p></br>";
        }
        return returnString;
    }
    async function handleRequest(_request, _response) {
        console.log("I hear voices!");
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");
        let q = Url.parse(_request.url, true);
        console.log(q.search);
        let jsonString = JSON.stringify(q.query);
        let input = JSON.parse(jsonString);
        if (input.task == "register") {
            let user = inputUser(input);
            if (!(await checkUser(user).catch(() => {
                console.log("Check failed!");
            }))) {
                storeUser(user);
                _response.write("user created!");
                _response.end();
            }
            else {
                _response.write("user already exists!");
                _response.end();
            }
        }
        else if (input.task == "showusers") {
            let responseString;
            responseString = await getUsers().catch(() => {
                console.log("failed!");
            });
            _response.write("" + responseString);
            _response.end();
        }
        else if (input.task == "signin") {
            if ((await checkPassword(input).catch(() => {
                console.log("Sign in failed!");
            }))) {
                _response.write("Sign in sucessful!");
                _response.end();
            }
            else {
                _response.write("Sign in unsucessful!");
                _response.end();
            }
        }
        else {
            _response.write("something went wrong!");
            _response.end();
        }
    }
})(P_3_1Server = exports.P_3_1Server || (exports.P_3_1Server = {}));
//# sourceMappingURL=server.js.map