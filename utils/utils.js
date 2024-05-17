const db = require("../db/db");
const faceapi = require("@vladmandic/face-api/dist/face-api.node-wasm.js");
const { Canvas, Image } = require("canvas");
const canvas = require("canvas");
faceapi.env.monkeyPatch({ Canvas, Image });

async function LoadModels() {
  const startTime = new Date();

  // Load the models

  await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + "/models");
  console.log("Loaded 1");
  await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + "/models");
  console.log("Loaded 2");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + "/models");
  console.log("Loaded 3");
  await faceapi.nets.ageGenderNet.loadFromDisk(__dirname + "/models");
  console.log("Loaded 4");
  const endTime = new Date();
  const totalTime = (endTime - startTime) / 1000;
  console.log(`Models loaded in ${totalTime} seconds`);
}

LoadModels();

async function getDescriptorsFromDB(imagePath) {
  try {
    const img = await canvas.loadImage(imagePath);
    const displaySize = { width: img.width, height: img.height };
    const canvasElement = faceapi.createCanvasFromMedia(img);
    const ctx = canvasElement.getContext("2d");
    faceapi.matchDimensions(canvasElement, displaySize);

    const query = `SELECT * FROM faces;`;
    const client = await db.connect();
    const result = await client.query(query);
    client.release();

    const labeledDescriptors = [];
    for (const row of result.rows) {
      const descriptors = [];
      for (const descObj of row.descriptions) {
        const descriptorArray = new Float32Array(Object.values(descObj));
        descriptors.push(normalize(descriptorArray)); // Normalize descriptors
      }

      labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(row.label, descriptors)
      );
    }

    const startTime = new Date();
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5); // Adjust threshold if necessary

    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const resultsWithBox = resizedDetections.map((detection) => {
      const normalizedDescriptor = normalize(detection.descriptor);
      const bestMatch = faceMatcher.findBestMatch(normalizedDescriptor);
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: bestMatch.toString(),
      });
      drawBox.draw(canvasElement);

      // Set a minimum distance threshold for known faces
      const minDistanceThreshold = 0.024; // Adjust as necessary
      if (bestMatch._distance < minDistanceThreshold) {
        // If the distance is below the threshold, consider the face as known
        return {
          _label: bestMatch._label,
          _distance: bestMatch._distance,
          _box: box,
        };
      } else {
        // Otherwise, label the face as "Unknown"
        return {
          _label: "Unknown",
          _distance: bestMatch._distance,
          _box: box,
        };
      }
    });

    const endTime = new Date();
    const totalTime = (endTime - startTime) / 1000;
    console.log(`Face Matched in ${totalTime} seconds`);
    return resultsWithBox;
  } catch (error) {
    console.error(
      "Error retrieving face descriptors from the database:",
      error.message
    );
    return [];
  }
}

function normalize(descriptor) {
  const sum = descriptor.reduce((acc, val) => acc + val * val, 0);
  const magnitude = Math.sqrt(sum);
  return descriptor.map((value) => value / magnitude);
}

async function uploadLabeledImages(images, label, userId) {
  try {
    const descriptions = [];
    const userIdCurrent = userId;
    // Loop through the images
    const startTime = new Date();
    for (let i = 0; i < images.length; i++) {
      const img = await canvas.loadImage(images[i]);
      // Read each face and save the face descriptions in the descriptions array
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      const normalizedDescriptor = normalize(detections.descriptor);
      descriptions.push(normalizedDescriptor);
    }

    // Convert the descriptions array to a JSON string
    const descriptionsJson = JSON.stringify(descriptions);

    // Create a new face document with the given label and save it in the database
    const createFace = {
      label: label,
      descriptions: descriptionsJson,
    };

    // Insert the face data into the PostgreSQL database

    const insertQuery = `
        INSERT INTO faces (label, descriptions, addedbyuserid)
        VALUES ($1, $2, $3)
        RETURNING id;
      `;

    const address = `/uploads/${label}/`;

    const insertQueryPerson = `
      INSERT INTO person (name, reported_by, image_path)
      VALUES ($1, $2, $3)`;

    const insertQueryReport = `
      INSERT INTO report (user_id)
      VALUES ($1)`;

    const values = [createFace.label, createFace.descriptions, userIdCurrent];
    const valuesPerson = [label, userIdCurrent, address];
    const valuesReport = [userIdCurrent];

    const client = await db.connect();
    const result = await client.query(insertQuery, values);
    const personUpdate = await client.query(insertQueryPerson, valuesPerson);
    const reportUpdate = await client.query(insertQueryReport, valuesReport);
    client.release();

    const endTime = new Date();
    const totalTime = (endTime - startTime) / 1000;
    console.log("Inserted face data with ID:", result.rows[0].id);
    console.log(`Time Taken to Insert Face in ${totalTime} seconds`);
    //console.log("Inserted Person Information:", result2.rows[0].person_id);
    return true;
  } catch (error) {
    console.error("Error uploading labeled images:", error.message);
    return false;
  }
}

module.exports = { getDescriptorsFromDB, uploadLabeledImages };
