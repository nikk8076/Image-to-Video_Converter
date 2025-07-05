const token = localStorage.getItem('token');
const [header, payload, signature] = token.split('.');
const decodedPayload = JSON.parse(atob(payload));
document.querySelector('#username').innerHTML = decodedPayload.sub;

let queued_img_array = [];
let img_name_array = [];
const queue = document.querySelector(".queue");
function add_eventToimages(){
const displayImages = document.querySelectorAll(".display-img .onclicks")
displayImages.forEach(image => {
    image.addEventListener("click", () => {
        // alert("hi");
        addImageToQueue(image);
    });
});
}

function addImageToQueue(image) {
    const imgSrc = image.src;
    const imgname = image.name;
    alert(imgname);
    queued_img_array.push(imgSrc);
    img_name_array.push(imgname);
    displayQueuedImages();
}

function displayQueuedImages() {
    let images = "";
    queued_img_array.forEach((image, index) => {
        images += `<div class="image">
            <img src="${image}" alt="image">
            <span onclick="deleteQueuedImage(${index})">&times;</span>
            </div>`;
    });
    queue.innerHTML = images;
}

function deleteQueuedImage(index) {
    queued_img_array.splice(index, 1);
    img_name_array.splice(index,1);
    displayQueuedImages();
}

const queuedForm = document.querySelector(".queued-form");
queuedForm.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("Queued images:", queued_img_array);
    queued_img_array = [];
    img_name_array = [];
    displayQueuedImages();
});


// function preview() {
    // document.querySelector("#preview").style.display = "block";
    // document.querySelector('#preview').innerHTML=`<source src="static/output_video.mp4" type="video/mp4" id="vid">`
// }

img_container = document.querySelector(".display-img")

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
    images = `<img src="${item[1]}" alt="image" class="onclicks" name=${item[0]}>`
    img_container.innerHTML += images;
    add_eventToimages();
});
    // Handle success, e.g., redirect to homepage
    
})
.catch(error => {
    // Handle error
    console.error('Login failed:', error);
});     

function send_names() {
    alert(queued_img_array.length);
    if (queued_img_array.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < queued_img_array.length; i++) {
            formData.append('imgsrc', queued_img_array[i]);
        }
        formData.append('transfx',document.querySelector('#transitionEffect').value);
        formData.append('duration',document.querySelector('#imageDuration').value);
        formData.append('audio',document.querySelector('#audioeffect').value);
        formData.append('quality',document.querySelector('#qualityeffect').value);
        // formData.append('username', decodedPayload.sub);
        fetch('/video_make', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                alert('Image names sent successfully');
            } else {
                alert('Failed to send image names');
            }
        })
        .then(data => {
            // document.querySelector('#preview').innerHTML=`<source src="static/output_video.mp4" type="video/mp4" id="vid">`
            // document.querySelector('#preview').style.display="none"
        })
        .catch(error => {
            console.error('Error:', error);
        });

    }
}