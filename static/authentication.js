if(localStorage.getItem('token')!=null){
    Auth();
}

let login = true;
let signup = false;
function Login() {
    if (!login) {
        document.querySelector("#name").style.display = "none";
        document.querySelector("#email").style.display = "none";
        document.querySelector(".Name").style.display = "none";
        document.querySelector(".Email").style.display = "none";
        document.querySelector("#login").style.backgroundColor = "#25827d";
        document.querySelector("#signup").style.backgroundColor = "white";
        document.querySelector("#form").style.top = "30vh";
        document.querySelector("#send").setAttribute("onclick", "send_login()");
        login = true;
        signup = false;
    }
}

function Signup() {
    if (!signup) {
        document.querySelector("#name").style.display = "block";
        document.querySelector("#email").style.display = "block";
        document.querySelector(".Name").style.display = "block";
        document.querySelector(".Email").style.display = "block";
        document.querySelector("#login").style.backgroundColor = "white";
        document.querySelector("#signup").style.backgroundColor = "#25827d";
        document.querySelector("#form").style.top = "15vh";
        document.querySelector("#send").setAttribute("onclick", "send_signup()");
        login = false;
        signup = true;
    }
}
function send_login() {
    let username = document.querySelector("#username").value;
    let password = document.querySelector("#password").value;
    alert("going");
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
        .then(response => response.json())
        .then(data => {
            // Handle success, e.g., redirect to homepage
            console.log(data);
            if(data.admin == 'admin'){
                window.location.href = "/admin_page";
            }
            else{
                const token = data.access_token;
                localStorage.setItem('token', token);
                Auth();
            }
        })
        .catch(error => {
            // Handle error
            console.error('Login failed:', error);
        });
}
function Auth() {
    fetch('/protected', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const username = data.logged_in_as;
            window.location.href = "/home_page";
            // sendname(username);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
// function sendname(name){
//     fetch('/home_page',{
//         method: 'POST',
//         headers:{
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             username: name
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log(data);
//         window.location.href = "/home_page";
//     })
//     .catch(error =>{
//         console.error('Error:', error);
//     });
// }

function send_signup() {
    let name = document.querySelector("#name").value;
    let email = document.querySelector("#email").value;
    let username = document.querySelector("#username").value;
    let password = document.querySelector("#password").value;
    alert("going here too!!");
    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            email: email,
            username: username,
            password: password
        })
    })
        .then(response => response.json())
        .then(data => {
            // Handle success, e.g., redirect to homepage
            window.location.href = data.redirect_url;
        })
        .catch(error => {
            // Handle error
            console.error('Sign-up failed:', error);
        });
}