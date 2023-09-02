const socket = io();
// Initialize an array to store selected member names
const selectedMembers = [];


// Join a room when the button is clicked
document.getElementById("joinRoomButton").addEventListener("click", () => {
  const room = document.getElementById("roomInput").value;
  const Name = document.getElementById("nameInput").value;

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
    const membersListContainer = document.getElementById("membersListContainer");
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

// Upload a file
document.getElementById("uploadForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const room = document.getElementById("roomInput").value;
  const formData = new FormData(event.target);
  formData.append("room", room);
  // socket.emit('sendlist',selectedMembers);
  formData.append("sendlist",selectedMembers);

  fetch("/upload/" + room, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    });
});

// Receive file upload notifications
socket.on("fileUploaded", (data) => {
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-bottom-right";
  toastContainer.className =
    "fixed flex items-center w-full max-w-xs p-4 space-x-4 text-white bg-blue-500 divide-x divide-gray-200 rounded-lg shadow right-5 bottom-5 ";
  toastContainer.setAttribute("role", "alert");

  const toastContent = document.createElement("div");
  toastContent.className = "text-sm font-normal";
  toastContent.textContent = "A File has been Uploaded";

  toastContainer.appendChild(toastContent);

  document.body.appendChild(toastContainer);

  // Remove the toast after 3 seconds
  setTimeout(function () {
    document.body.removeChild(toastContainer);
  }, 3000);
});

// Receive messages
socket.on("messageReceived", (message) => {
  document.getElementById("messages").innerText += message + "\n";
});

socket.on("link", (data) => {
  const message = `File uploaded to room: ${data.room} `;

  // Create a new list item for the message
  const listItem = document.createElement("li");
  listItem.textContent = message;

  // Create a download link for the file
  const downloadLink = document.createElement("a");
  downloadLink.href = data.filePath; // This should be the path to the uploaded file on the server
  downloadLink.download = data.filePath.split("/").pop(); // Extract the filename
  downloadLink.textContent = "Download File";

  // Append the download link to the list item
  listItem.appendChild(downloadLink);

  // Append a line break after the list item
  listItem.appendChild(document.createElement("br"));

  // Append the list item to the messages list
  const messagesList = document.getElementById("messages");
  messagesList.appendChild(listItem);

  // Make sure the box is visible when a file is uploaded
  const box = document.getElementById("box");
  box.style.display = "block";
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
  if (checkbox.checked) {
    // If checkbox is checked, add the name to the selectedMembers array
    selectedMembers.push(checkbox.value);
  } else {
    // If checkbox is unchecked, remove the name from the selectedMembers array
    const index = selectedMembers.indexOf(checkbox.value);
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





