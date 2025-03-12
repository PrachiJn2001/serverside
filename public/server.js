// server.js
// Import necessary modules
const express = require('express'); // Express.js for creating the server
const bodyParser = require('body-parser'); // Middleware to parse request bodies
const fs = require('fs'); // File system module to read and write files

const app = express(); // Create an Express application
const port = 3000; // Define the port the server will listen on

// Middleware to parse URL-encoded and JSON request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' folder
// This makes files in the 'public' folder accessible directly from the browser
app.use(express.static('public'));

// Path to the users.json file where user data will be stored
const usersFilePath = 'users.json';

// --- Helper function to read user data from users.json ---
function readUsersData() {
    try {
        // Try to read the users.json file
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        // Parse the JSON data, or return an empty array if the file is empty
        return JSON.parse(usersData || '[]');
    } catch (error) {
        // If the file doesn't exist or there's an error reading/parsing, return an empty array
        return [];
    }
}

// --- Helper function to write user data to users.json ---
function writeUsersData(users) {
    try {
        // Convert the users array to JSON string and write it to users.json
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2)); // Use 2 spaces for indentation in JSON file
        return true; // Indicate success
    } catch (error) {
        console.error("Failed to write user data to file:", error);
        return false; // Indicate failure
    }
}

// --- Signup endpoint: handles POST requests to /signup ---
app.post('/signup', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        // If email or password is missing, send a 400 Bad Request response
        return res.status(400).send('Email and password are required.');
    }

    // Read existing users from users.json
    const users = readUsersData();

    // Check if a user with the given email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        // If user already exists, send a 409 Conflict response
        return res.status(409).send('Email already registered.');
    }

    // Create a new user object with email, password, and a timestamp
    const newUser = {
        email: email,
        password: password, // WARNING: In a real application, you should hash the password!
        timestamp: new Date().toISOString() // Add a timestamp for when the user signed up
    };

    // Add the new user to the users array
    users.push(newUser);

    // Write the updated users array back to users.json
    if (writeUsersData(users)) {
        // If writing to file is successful, send a success response
        res.status(201).send('Signup successful!');
    } else {
        // If writing to file fails, send a 500 Internal Server Error response
        res.status(500).send('Signup failed. Could not save user data.');
    }
});

// --- Login endpoint: handles POST requests to /login ---
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        // If email or password is missing, send a 400 Bad Request response
        return res.status(400).send('Email and password are required.');
    }

    // Read users data from users.json
    const users = readUsersData();

    // Find a user with the provided email and password
    const user = users.find(user => user.email === email && user.password === password); // WARNING: In real app, compare hashed passwords!

    if (user) {
        // If user found and credentials match, send a success response
        res.status(200).send('Login successful!');
    } else {
        // If no matching user is found, send a 401 Unauthorized response
        res.status(401).send('Invalid email or password.');
    }
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`); // Log message when server starts
});
