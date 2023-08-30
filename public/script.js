
const socket = io();

// Join a room when the button is clicked
document.getElementById('joinRoomButton').addEventListener('click', () => {
  const room = document.getElementById('roomInput').value;
  socket.emit('joinRoom', room);
});

// Upload a file
document.getElementById('uploadForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const room = document.getElementById('roomInput').value;
  const formData = new FormData(event.target);
  formData.append('room', room);

  fetch('/upload/' + room, {
    method: 'POST',
    body: formData
  })
  .then(response => response.text())
  .then(data => {
    console.log(data);
  });
});

// Receive file upload notifications
socket.on('fileUploaded', (data) => {
  const message = `File uploaded to room: ${data.room}\nDownload: ${data.filePath}`;
  document.getElementById('messages').innerText += message + '\n';
});

// Receive messages
socket.on('messageReceived', (message) => {
  document.getElementById('messages').innerText += message + '\n';
});

// Receive file upload notifications
socket.on('fileUploaded', (data) => {
const message = `File uploaded to room: ${data.room}\n`;
const downloadLink = document.createElement('a');
downloadLink.href = data.filePath; // This should be the path to the uploaded file on the server
downloadLink.download = data.filePath.split('/').pop(); // Extract the filename
downloadLink.textContent = 'Download File';

// Append the message and download link to the messages div
const messagesDiv = document.getElementById('messages');
messagesDiv.appendChild(document.createTextNode(message));
messagesDiv.appendChild(downloadLink);
messagesDiv.appendChild(document.createElement('br')); // Add line break
});

