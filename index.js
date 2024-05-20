const express = require("express");

const tf = require("@tensorflow/tfjs");
const wasm = require("@tensorflow/tfjs-backend-wasm");
const faceapi = require("@vladmandic/face-api/dist/face-api.node-wasm.js");

const multer = require("multer");
const path = require("path");
const app = express();
const port = 3000;

const { Canvas, Image } = require("canvas");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { default: Swal } = require("sweetalert2");

const db = require("./db/db");

const routes = require("./routes/routes");

faceapi.env.monkeyPatch({ Canvas, Image });

app.use(express.static("public"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  session({
    secret: "123456",
    resave: false,
    saveUninitialized: false,
  })
);

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

wasm.setWasmPaths("node_modules/@tensorflow/tfjs-backend-wasm/dist/");

async function initialize() {
  await tf.setBackend("wasm");
  await tf.ready();
}

initialize();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

async function createFacesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS faces (
      id SERIAL PRIMARY KEY,
      label TEXT UNIQUE NOT NULL,
      descriptions JSONB NOT NULL
    );
  `;

  try {
    const client = await db.connect();
    await client.query(createTableQuery);
    console.log("Faces table created or already exists");
    client.release();
  } catch (error) {
    console.error("Error creating faces table:", error.message);
  }
}

createFacesTable();

app.get("/upload", isAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/upload.html");
});

app.get("/checkface", (req, res) => {
  res.sendFile(__dirname + "/checkFace.html");
});

app.get("/start", (req, res) => {
  res.sendFile(__dirname + "/start.html");
});

app.get("/displayrecords", (req, res) => {
  res.sendFile(__dirname + "/public/displayrecords.html");
});

app.get("/userauth", (req, res) => {
  res.sendFile(__dirname + "/public/userauth.html");
});
app.get("/login", (req, res) => {
  // Render your login form here
  res.sendFile(__dirname + "/public/userauth.html");
});

app.get("/profile", isAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/public/profile.html");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  // Use path.join to construct the absolute path to your HTML file
  const dashboardPath = path.join(__dirname, "public", "dashboard.html");
  res.sendFile(dashboardPath);
});

app.get("/api/isAuthenticated", (req, res) => {
  console.log("Called");
  if (req.session.user) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

const upload = multer({ dest: "uploads/" });

// User registration endpoint

// Handle POST requests to /register using the multer middleware
app.post("/register", upload.none(), async (req, res) => {
  try {
    const { username, password, email } = req.body;
    console.log("Received Form Data:", { username, password, email });
    // Hash the password before inserting it into the database
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert app user into the database
    const query = `
      INSERT INTO appuser (username, password, email)
      VALUES ($1, $2, $3)
      RETURNING username, password, email;
    `;
    const values = [username, hashedPassword, email];

    const client = await db.connect();
    const result = await client.query(query, values);
    client.release();
    console.log(result);
    if (result.rows.length > 0) {
      // Registration was successful, redirect to the updateinfopage
      // res.redirect("/updateinfopage");
      res.status(200).json({
        success: true,
      });
      console.log("DONE");
    } else {
      // Handle the case where registration failed
      res.status(500).json({
        success: false,
        error: "Registration failed",
      });
    }
  } catch (error) {
    console.error("Error registering AppUser:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

///////////////////////////Login////////////////////////////

app.post("/login", upload.none(), async (req, res) => {
  const { loginemail, loginpassword } = req.body;

  try {
    console.log(loginemail, loginpassword);
    const query = "SELECT * FROM appuser WHERE email = $1";
    const values = [loginemail];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const user = result.rows[0];

    // Compare the password from the database with the provided password
    const passwordsMatch = await bcrypt.compare(loginpassword, user.password);
    if (!passwordsMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // Store user data in the session
    req.session.user = user;
    Swal; // TO check
    // Respond with a success message and user data
    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Use the route defined in routes.js
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
