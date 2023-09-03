const express = require("express");
const os = require("os");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const membersList = [];
const userList = [];
const userSocketMap = {};
const port = 3300;
const { createProxyMiddleware } = require("http-proxy-middleware");

// Define a proxy route
const apiProxy = createProxyMiddleware("/api", {
  target: "http://target-server-url", // Replace with the URL of your target server
  changeOrigin: true, // Necessary for virtual hosted sites
  pathRewrite: {
    "^/api": "", // Remove the '/api' prefix when forwarding the request
  },
});

// Use the proxy middleware
app.use("/api", apiProxy);
// Use the cors middleware to allow all origins (for local development)
app.use(cors());

// Get the local IP address of the server
const localIpAddress = Object.values(os.networkInterfaces())
  .flat()
  .find((iface) => iface.family === "IPv4" && !iface.internal).address;

app.use(fileUpload());
app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Serve files from the specified directory
app.use(
  "/uploads",
  express.static("C:/Users/HP/Desktop/New folder/Referrrrer/app")
);

// function emitProgress(socket, progress) {
//   socket.emit("uploadProgress", { progress });
// }

app.post("/upload/:room", (req, res) => {
  const room = req.params.room;
  console.log(req.body);
  console.log(req.body.sendlist);
  const sendList = req.body.sendlist.split(",");

  // Parse the list of names from the request body

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const uploadedFile = req.files.file;

  uploadedFile.mv(
    "C:/Users/HP/Desktop/New folder/Referrrrer/app/" + uploadedFile.name,
    (err) => {
      if (err) {
        return res.status(500).send(err);
      }

      const uploadedFilePath = `/uploads/${uploadedFile.name}`;

      // Assuming you send it as an array of names
      // Emit the fileUploaded event to specific users
      sendList.forEach((userName) => {
        const socketId = userSocketMap[userName];
        if (socketId) {
          io.to(socketId).emit("fileUploaded", {
            filePath: uploadedFilePath,
            room,
          });
          io.to(socketId).emit("link", { filePath: uploadedFilePath, room });
        }
      });

      // io.to(room).emit("fileUploaded", { filePath: uploadedFilePath, room });
      // io.to(room).emit("link", { filePath: uploadedFilePath, room });

      return res.status(200).send("File uploaded to room: " + room);
    }
  );
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (data) => {
    // Add the new user to the list of members
    socket.userName = data.n;
    socket.roomNo = data.r;
    membersList.push(data.n);
    // Add the user to the userList
    userList.push({ name: data.n, room: data.r });
    socket.join(data.r);
    io.to(data.r).emit("jointoast", data.n);
    io.to(data.r).emit("userJoined", data.n);
    userSocketMap[data.n] = socket.id;
    // Send the updated list of members to all clients in the room
    io.to(data.r).emit(
      "updateMembers",
      membersList.filter((member) =>
        userList.some((user) => user.room === data.r && user.name === member)
      )
    );
    console.log(`User joined room: ${data.r}`);
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    // Identify the userName and roomNo of the disconnected user
    const userName = socket.userName; // Assuming you have set this during connection
    const roomNo = socket.roomNo; // Assuming you have set this during connection
    console.log(roomNo);

    // Find and remove the disconnected user from the userList
    const userIndex = userList.findIndex(
      (user) => user.name === userName && user.room === roomNo
    );
    if (userIndex !== -1) {
      userList.splice(userIndex, 1);
    }

    // Create a new list of members for the specific room
    const roomMembers = userList.filter((user) => user.room === roomNo);
    console.log(roomMembers);

    // Extract only the 'name' attribute from the roomMembers list
    const memberNames = roomMembers.map((user) => user.name);
    delete userSocketMap[userName];
    // Emit the updated member list (names only) to all users in the room
    io.to(roomNo).emit("updateMembers", memberNames);
    io.to(roomNo).emit("left", userName);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://${localIpAddress}:${port}`);
});
