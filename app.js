const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.use(express.json());

const mongoUrl = "mongodb+srv://arranguezaljohn0130:admin@cluster1.0mrsd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";
const JWT_SECRET = "sadkgnbgkfhhsad[]fhgfhdstffsdf()gddguyuioiokvnmxbxvghkllsiuyyuuyuqq";

// Database Connection
mongoose.connect(mongoUrl)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((e) => {
    console.error("Database connection error:", e);
  });

// Import UserDetails model
require('./UserDetails');
const User = mongoose.model("UserInfo");

// Home Route
app.get("/", (req, res) => {
  res.send({ status: "Started" });
});

// Middleware to Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ status: "error", data: "Access Denied" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ status: "error", data: "Invalid Token" });
    }
    req.user = user;
    next();
  });
};

// Register Route
app.post('/register', async (req, res) => {
  const { username, password, name, address, bio, pronouns } = req.body;

  try {
    const oldUser = await User.findOne({ username });

    if (oldUser) {
      return res.status(400).send({ status: "error", data: "User already exists!" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: encryptedPassword,
      fullname: name,
      address,
      bio,
      pronouns,
    });

    res.status(201).send({ status: "ok", data: "User Created" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send({ status: "error", data: "Internal Server Error" });
  }
});

// Login Route
app.post("/login-user", async (req, res) => {
  const { username, password } = req.body;

  try {
    const oldUser = await User.findOne({ username });
    if (!oldUser) {
      return res.status(404).send({ status: "error", data: "User doesn't exist!" });
    }

    const isPasswordValid = await bcrypt.compare(password, oldUser.password);
    if (!isPasswordValid) {
      return res.status(401).send({ status: "error", data: "Invalid password" });
    }

    const token = jwt.sign({ email: oldUser.username }, JWT_SECRET);
    return res.status(200).send({ status: "ok", data: token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ status: "error", data: "Internal Server Error" });
  }
});

// Get Profile Route
app.get('/get-profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.email });
    if (!user) {
      return res.status(404).send({ status: "error", data: "User not found" });
    }

    // Return user details without the password
    const { username, fullname, address, bio, pronouns, profilePicture } = user;
    res.status(200).send({
      status: "ok",
      data: { 
        username, 
        fullname, 
        address, 
        bio, 
        pronouns, 
        profilePicture: profilePicture || null // Handle missing profilePicture
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send({ status: "error", data: "Internal Server Error" });
  }
});

// Start Server
app.listen(5001, () => {
  console.log("Node.js server started on port 5001");
});
