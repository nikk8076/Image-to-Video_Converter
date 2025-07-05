const token= localStorage.getItem('token');
const [header,payload,signature]=token.split('.');
const decodedPayload=JSON.parse(atob(payload));
document.querySelector('#username').innerHTML=decodedPayload.sub;

let queued_img_array = [];

queuedform = document.querySelector(".queued-form");
queue = document.querySelector(".queue");
input = document.querySelector(".input-box input");
inputbox = document.querySelector(".input-box");

input.addEventListener("change", () => {
    const files = input.files;
    for (let i = 0; i < files.length; i++) {
        queued_img_array.push(files[i]);
    }
    queuedform.reset();
    displayQueuedImages();
});

inputbox.addEventListener("dragover", (e) => {
    e.preventDefault();
});

inputbox.addEventListener("drop", (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
        if (!files[i].type.match("image")) continue;
        queued_img_array.push(files[i]);
    }
    displayQueuedImages();
});


function displayQueuedImages() {
let images = ""
    queued_img_array.forEach((image, index) => {
        images += `<div class="image">
            <img src="${URL.createObjectURL(image)}" alt="image">
            <span onclick="deleteQueuedImage(${index})">&times;</span>
            </div>`
    })
    queue.innerHTML = images
}

function deleteQueuedImage(index) {
    queued_img_array.splice(index, 1);
    displayQueuedImages();
}
function uploadImages() {
    // Send data to the server
    alert(queued_img_array.length);
    if (queued_img_array.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < queued_img_array.length; i++) {
            formData.append('files', queued_img_array[i]);
        }
        formData.append('username', decodedPayload.sub);
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                alert('Images uploaded successfully');
            } else {
                alert('Failed to upload images');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}