// require("dotenv").config();
// const express = require("express");
// // const mongoose = require("mongoose");
// // const SDPSchema = require("./models");
// const app = express();
// const SECRET = process.env;
// const PORT = SECRET.PORT || 7000;

// // app.use(express.json());

// // app.use("/", (req, res) => res.status(200).json({ success: true }));

// // app.post("/offer/:msgType", async (req, res) => {
// //   const { offer } = req.body;
// //   const { msgType } = req.params;
// //   try {
// //     await SDPSchema.create({
// //       msg: offer,
// //       msgType,
// //     });
// //     res.status(201).json({ success: true });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // });

// // app.get("/offers", async (req, res) => {
// //   try {
// //     const offers = await SDPSchema.find({ msgType: "offer" });
// //     res.status(200).json({ success: true, offers });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // });

// app.listen(PORT, async () => {
//   try {
//     await mongoose.connect(SECRET.MONGO_URI);
//     console.log("DB Connected");
//     console.log(`Server runnning on http://localhost:${PORT}`);
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// });

require("dotenv").config();
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

// const app = express();
// app.use(cors());
// const server = http.createServer(app);
const io = new Server({
  cors: {
    origin: "http://192.168.1.19:4200",
  },
});
// const io = socketIo(server);
const PORT = process.env.PORT;

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("offer", (data) => {
    socket.broadcast.emit("new-offer", data);
  });

  socket.on("answer", (data) => {
    socket.broadcast.emit("new-answer", data);
  });

  socket.on("candidate",(data)=>{
    socket.broadcast.emit("new-candidate",data)
  })

  socket.on("end-call",(data)=>{
    socket.broadcast.emit("notify-call-ended",data)
  })
});

io.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});
