alert("Login successful");
const token = localStorage.getItem('token');
const [header, payload, signature] = token.split('.');
const decodedPayload = JSON.parse(atob(payload));
document.querySelector('#username').innerHTML = decodedPayload.sub;
function logout() {
    localStorage.removeItem('token');
    window.location.href = "http://localhost:5000/"
}
img_container = document.querySelector(".image_container")

username = document.querySelector('#username').innerHTML;
alert(username);
fetch('/display_images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
        })
    })
        .then(response => response.json())
        .then(data => {
            let images = ""
            data.forEach(item => {
            // alert(item);
            images += `<img src="${item[1]}" alt="image" class="images">`
            img_container.innerHTML = images;
        });
            // Handle success, e.g., redirect to homepage
        })
        .catch(error => {
            // Handle error
            console.error('Login failed:', error);
        });
// const response = fetch('/display_images', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username})
//     });
//     const data = response.json();
// Iterate over the list and display each element