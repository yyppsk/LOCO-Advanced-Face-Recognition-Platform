# LOCO: Advanced Face Recognition Platform

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![FaceAPI](https://img.shields.io/badge/FaceAPI-3776AB?style=for-the-badge&logo=javascript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Canvas](https://img.shields.io/badge/Canvas-000000?style=for-the-badge&logo=canvas&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-v1.4.2-orange)
![Bcrypt](https://img.shields.io/badge/Bcrypt-v5.0.1-red)

## Overview

LOCO: Advanced Face Recognition Platform is a web application designed to help locate and reunite missing people in India and around the world. The platform leverages face recognition technology to identify missing individuals and assists common people, police, and other important agencies in their efforts.

## Features

- **Face Recognition:** Utilizes face-api.js for detecting, aligning, and recognizing faces.
- **Database Integration:** Stores and retrieves data using PostgreSQL.
- **User-Friendly Interface:** Built with TailwindCSS for a responsive and modern UI.
- **Real-Time Search:** Quickly matches missing person reports with the database using optimized algorithms.
- **API Endpoints:** Provides endpoints for uploading and fetching missing person data.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Frontend:** TailwindCSS, HTML5, JavaScript
- **Face Recognition:** FaceAPI, Canvas

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yyppsk/LOCO-Advanced-Face-Recognition-Platform.git
    cd LOCO-Advanced-Face-Recognition-Platform
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Set up PostgreSQL database:**
    - Ensure PostgreSQL is installed and running.
    - Create a database and update the connection details in the `.env` file.

4. **Run the application:**
    ```sh
    npm start
    ```

## API Endpoints

### Index.js

#### Fetch All Missing People
- **URL:** `/fetchAllMissing/`
- **Method:** GET
- **Description:** Fetches data of all missing people.
- **Response:**
    - Status 200: JSON array of missing people data.
    - Status 404: `{ error: "No missing persons found" }`
    - Status 500: `{ error: "Internal server error" }`

### Routes (routes folder)

#### User Registration
- **URL:** `/register`
- **Method:** POST
- **Description:** Registers a new user.
- **Request Body:**
    - `username`: String
    - `password`: String
- **Response:**
    - Status 201: `{ message: "User registered successfully" }`
    - Status 400: `{ error: "User already exists" }`
    - Status 500: `{ error: "Internal server error" }`

#### User Login
- **URL:** `/login`
- **Method:** POST
- **Description:** Logs in a user.
- **Request Body:**
    - `username`: String
    - `password`: String
- **Response:**
    - Status 200: `{ message: "Login successful", token: "JWT token" }`
    - Status 401: `{ error: "Invalid credentials" }`
    - Status 500: `{ error: "Internal server error" }`

#### Upload Labeled Images
- **URL:** `/uploadLabeledImages`
- **Method:** POST
- **Description:** Uploads and labels images for face recognition.
- **Request Body:**
    - `images`: Array of image paths
    - `label`: String
    - `userId`: Integer
    - `gender`: String
    - `city`: String
    - `age`: Integer
    - `description`: String
- **Response:**
    - Status 201: `{ message: "Images uploaded successfully" }`
    - Status 500: `{ error: "Internal server error" }`

### GET Endpoints

- **`/fetchuserinfo`**: Fetches logged-in user information.
- **`/fetchUserInfobyid/:id`**: Fetches information about a missing person by ID.
- **`/fetchAllMissing/`**: Fetches all missing persons' records.
- **`/fetchReportedBy/:id`**: Fetches the reporter's (agency) information by user ID.
- **`/dashboardfetch`**: Fetches missing persons reported by the logged-in user for the dashboard.

### PUT Endpoints

- **`/persons/:id`**: Updates information about a missing person by ID.
- **`/updateuserinfo`**: Updates the logged-in user's information.

### DELETE Endpoints

- **`/persons/:id`**: Deletes a missing person record by ID.

### POST Endpoints

- **`/check-face`**: Uploads an image and checks the face against the database.
- **`/upload`**: Uploads multiple images and associates them with a name.
- **`/post-face`**: Uploads labeled images and stores face data along with additional information.
