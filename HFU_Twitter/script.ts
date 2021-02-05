namespace HFUTwitter {

    function getSubpage(): string {
        return window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    }

    //navigation
    if (getSubpage() == "index.html") {
        let buttonToSignin: HTMLElement = document.getElementById("toSignin");
        buttonToSignin.addEventListener("click", handleToSignin);
        function handleToSignin (_event: Event): void {
            window.open("signin.html", "_self");
        }
    }
    if (getSubpage() == "signin.html") {
        let buttonToLogin: HTMLElement = document.getElementById("toLogin");
        buttonToLogin.addEventListener("click", handleToSignin);
        function handleToSignin (_event: Event): void {
            window.open("index.html", "_self");
        }
    }

    //Sign In Page
    if (getSubpage() == "signin.html") {
        let buttonSignin: HTMLElement = document.getElementById("submit");
        buttonSignin.addEventListener("click", handleToSignin);
        async function handleToSignin (_event: Event): Promise<void> {
            let formData: FormData = new FormData(document.forms[0]);
            let query: URLSearchParams = new URLSearchParams(<any>formData);            
            let url: string = "https://hfu-twitter.herokuapp.com";
            url += "/signin" + "?" + query.toString();

            await fetch(url);
        }
    }
}