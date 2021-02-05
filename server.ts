import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";

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