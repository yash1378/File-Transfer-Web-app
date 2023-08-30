// const express = require('express');
// const os = require('os');
// const fileUpload = require('express-fileupload');
// const cors = require('cors'); // Import the cors package
// const app = express();
// const port = 3300;

// // Use the cors middleware to allow all origins (for local development)
// app.use(cors());
// // Get the local IP address of the server
// const localIpAddress = Object.values(os.networkInterfaces())
//   .flat()
//   .find((iface) => iface.family === 'IPv4' && !iface.internal)
//   .address;


// app.use(fileUpload());
  
// app.use(express.static('./public'));

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/public/index.html');
// });

// // Serve files from the specified directory
// app.use('/uploads', express.static('C:/Users/HP/Desktop/New folder/Referrrrer/app'));

// app.post('/upload', (req, res) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res.status(400).send('No files were uploaded.');
//   }

//   const uploadedFile = req.files.file;

//   // Use forward slashes in the path
//   uploadedFile.mv('C:/Users/HP/Desktop/New folder/Referrrrer/app/' + uploadedFile.name, (err) => {
//     if (err) {
//       return res.status(500).send(err);
//     }

//     const uploadedFilePath = `/uploads/${uploadedFile.name}`;
//     // res.json({ fileUrl: uploadedFilePath });
//     res.writeHead(200, { 'Content-Type': 'text/html' });
//     res.end(`<html><body><a href="http://${localIpAddress}:${port}${uploadedFilePath}">Download File</a>
//     </body></html>`);
//   });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running at http://${localIpAddress}:${port}`);
// });





const express = require('express');
const os = require('os');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3300;

// Use the cors middleware to allow all origins (for local development)
app.use(cors());

// Get the local IP address of the server
const localIpAddress = Object.values(os.networkInterfaces())
  .flat()
  .find((iface) => iface.family === 'IPv4' && !iface.internal)
  .address;

app.use(fileUpload());

app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Serve files from the specified directory
app.use('/uploads', express.static('C:/Users/HP/Desktop/New folder/Referrrrer/app'));

app.post('/upload/:room', (req, res) => {
  const room = req.params.room;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const uploadedFile = req.files.file;

  uploadedFile.mv('C:/Users/HP/Desktop/New folder/Referrrrer/app/' + uploadedFile.name, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    const uploadedFilePath = `/uploads/${uploadedFile.name}`;
    io.to(room).emit('fileUploaded', { filePath: uploadedFilePath, room });

    return res.status(200).send('File uploaded to room: ' + room);
  });
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('sendMessage', (data) => {
    const { room, message } = data;
    io.to(room).emit('messageReceived', message);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://${localIpAddress}:${port}`);
});

