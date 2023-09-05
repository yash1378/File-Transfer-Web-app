const socket = io();
// Initialize an array to store selected member names
// Initialize an array to store selected member names
const selectedMembers = [];
// Add this at the top of your script.js
const fileReceiveToast = document.getElementById("fileReceiveToast");
const acceptFileButton = document.getElementById("acceptFileButton");
const rejectFileButton = document.getElementById("rejectFileButton");
const messagesList = document.getElementById("messages");
let receivedFilePath = null;
let receivedRoom = null;


// Join a room when the button is clicked
document.getElementById("joinRoomButton").addEventListener("click", (event) => {
  event.preventDefault();
  const room = document.getElementById("roomInput").value;
  const Name = document.getElementById("nameInput").value;
  const form = document.getElementById("form");
  const f = document.getElementById("haha");
  f.style.display = "none";
  form.style.display = "block";

  socket.emit("joinRoom", { r: room, n: Name });

  const joinbtn = document.getElementById("joinRoomButton");
  const roominput = document.getElementById("roomInput");
  const nameinput = document.getElementById("nameInput");
  const list = document.getElementById("list");

  // Toggle the visibility of the form
  if (joinbtn.style.display === "none") {
    joinbtn.style.display = "block"; // Show the form
    roominput.style.display = "block";
    nameinput.style.display = "block";
    list.style.display = "none";
  } else {
    joinbtn.style.display = "none"; // Show the form
    roominput.style.display = "none";
    nameinput.style.display = "none";
    list.style.display = "block";
  }

  socket.on("updateMembers", (membersList) => {
    // Update the HTML to display the list of members
    const membersListContainer = document.getElementById(
      "membersListContainer"
    );
    membersListContainer.innerHTML = "";

    membersList.forEach((member) => {
      // Create a list item element
      const memberItem = document.createElement("li");

      // Create a checkbox element
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = member;
      checkbox.name = "selectedMembers"; // You can give it a unique name
      checkbox.className = "member-checkbox"; // Add the class "member-checkbox"

      // Create a label for the checkbox with the member's name
      const label = document.createElement("label");
      label.textContent = member;

      // Append the checkbox and label to the list item
      memberItem.appendChild(checkbox);
      memberItem.appendChild(label);

      // Append the list item to the membersListContainer
      membersListContainer.appendChild(memberItem);

      // Add an event listener for the checkbox
      checkbox.addEventListener("change", () => {
        handleCheckboxChange(checkbox);
      });
    });
  });

  socket.on("jointoast", (msg) => {
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-bottom-right";
    toastContainer.className =
      "fixed flex items-center w-full max-w-xs p-4 space-x-4 text-white bg-green-500 divide-x divide-gray-200 rounded-lg shadow right-5 bottom-5 ";
    toastContainer.setAttribute("role", "alert");

    const toastContent = document.createElement("div");
    toastContent.className = "text-sm font-normal";
    toastContent.textContent = `${msg} has Joined the Room`;

    toastContainer.appendChild(toastContent);

    document.body.appendChild(toastContainer);

    // Remove the toast after 3 seconds
    setTimeout(function () {
      document.body.removeChild(toastContainer);
    }, 3000);
  });
});


document.getElementById("uploadForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const room = document.getElementById("roomInput").value;
  const n = document.getElementById("nameInput").value;

  const fileInput = document.getElementById('choose');
  const files = fileInput.files;

  if (files.length === 0) {
    alert('Please select one or more files.');
    return;
  }

  // Create a FormData object to send the files
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files[]', files[i]);
  }
  console.log(selectedMembers);
  formData.append("room", room);
  formData.append("sendlist", selectedMembers);
  formData.append("n",n);

  fetch("/upload/" + room, {
    method: "POST",
    body: formData,
  })
  .then((response) => response.text())
  .then((data) => {
    console.log(data);
  });
});



// Function to handle file upload and display messages
// Initialize an array to store uploaded file data
const uploadedFilesData = [];

// Function to handle file upload and store file data
function handleFileUpload(filePath, room) {
  // Store the file data in the uploadedFilesData array
  uploadedFilesData.push({ filePath, room });

  // Show the toast for file receive
  showFileReceiveToast(filePath);
}

var sen ;
socket.on("sender",(sender)=>{
  console.log(sender);
  sen = sender;
})

// Event listener for the "Accept" button
acceptFileButton.addEventListener("click", () => {
  // Check if there are uploaded files to display

  const Item = document.createElement("li");
  const r = document.createElement("div");
  r.innerHTML = `<b>These Files have been uploaded by ${sen}</b>`;
  Item.appendChild(r);
  messagesList.appendChild(r);
  if (uploadedFilesData.length > 0) {
    uploadedFilesData.forEach((fileData) => {
      // Create a new list item for each uploaded file
      const listItem = document.createElement("li");
      const message = `File uploaded to room: ${fileData.room}`;
      listItem.textContent = message;

      // Create a button for downloading the file
      const downloadButton = document.createElement("button");
      downloadButton.textContent = "Download File";
      downloadButton.className = "download-button";

      // Attach the file path to the button as a data attribute
      downloadButton.dataset.filePath = fileData.filePath;

      // Append the download button to the list item
      listItem.appendChild(downloadButton);

      // Append a line break after the list item
      listItem.appendChild(document.createElement("br"));

      // Append the list item to the messages list
      messagesList.appendChild(listItem);

      // Make sure the box is visible when a file is uploaded
      const box = document.getElementById("box");
      box.style.display = "block";
    });
    const Item = document.createElement("li");
    const r = document.createElement("div");
    r.innerHTML = `<br>`;
    Item.appendChild(r);
    messagesList.appendChild(r);

    // Clear the uploaded files data
    uploadedFilesData.length = 0;

    // Hide the toast
    fileReceiveToast.classList.add("hidden");
  }
});

// Handle the "fileUploaded" event
socket.on("fileUploaded", (data) => {
  showFileReceiveToast(data.filePath);
  handleFileUpload(data.filePath, data.room);
});

// Handle the "filesUploaded" event
socket.on("filesUploaded", (data) => {
  showFileReceiveToast(data.filePaths[0]); // Show toast for the first file
  data.filePaths.forEach((filePath) => {
    handleFileUpload(filePath, data.room);
  });
});

// Receive messages
socket.on("messageReceived", (message) => {
  document.getElementById("messages").innerText += message + "\n";
});


// // Function to show the file receive toast
function showFileReceiveToast(filePath) {
  receivedFilePath = filePath;
  fileReceiveToast.classList.remove("hidden");
}


// Event listener for the "Reject" button
rejectFileButton.addEventListener("click", () => {
  // Clear the uploaded files data
  uploadedFilesData.length = 0;

  // Hide the toast
  fileReceiveToast.classList.add("hidden");
});


// Add an event listener to handle file download when the button is clicked
document.addEventListener("click", (event) => {
  if (event.target && event.target.className === "download-button") {
    const filePath = event.target.dataset.filePath;

    // Trigger the file download by creating an invisible anchor element
    const downloadLink = document.createElement("a");
    downloadLink.href = filePath;
    downloadLink.download = filePath.split("/").pop(); // Extract the filename
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
});

// ...

// Update the "link" event handler to show the file receive toast
socket.on("link", (data) => {
  const message = `File uploaded to room: ${data.room} `;
  receivedRoom = data.room; // Store the room for later use
  showFileReceiveToast(data.filePath);
});



socket.on("left", (NAAM) => {
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-bottom-right";
  toastContainer.className =
    "fixed flex items-center w-full max-w-xs p-4 space-x-4 text-white bg-red-500 divide-x divide-gray-200 rounded-lg shadow right-5 bottom-5 ";
  toastContainer.setAttribute("role", "alert");

  const toastContent = document.createElement("div");
  toastContent.className = "text-sm font-normal";
  toastContent.textContent = `${NAAM} has left your room`;

  toastContainer.appendChild(toastContent);

  document.body.appendChild(toastContainer);

  // Remove the toast after 3 seconds
  setTimeout(function () {
    document.body.removeChild(toastContainer);
  }, 3000);
});

function handleCheckboxChange(checkbox) {
  const memberName = checkbox.value;
  if (checkbox.checked) {
    // If checkbox is checked, add the name to the selectedMembers array
    selectedMembers.push(memberName);
  } else {
    // If checkbox is unchecked, remove the name from the selectedMembers array
    const index = selectedMembers.indexOf(memberName);
    if (index !== -1) {
      selectedMembers.splice(index, 1);
    }
  }
}

// Add an event listener to the "Select All" checkbox
const selectAllCheckbox = document.getElementById("selectAllMembers");
selectAllCheckbox.addEventListener("change", function () {
  const checkboxes = document.querySelectorAll(".member-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAllCheckbox.checked;
    handleCheckboxChange(checkbox);
  });
});
