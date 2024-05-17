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

  await faceapi.nets.tinyFaceDetector.loadFromDisk(__dirname + "/models");
  await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(__dirname + "/models");
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
        descriptors.push(descriptorArray); // No normalization
      }

      labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(row.label, descriptors)
      );
    }

    const startTime = new Date();
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // Adjust threshold if necessary

    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const resultsWithBox = resizedDetections.map((detection) => {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor); // No normalization
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: bestMatch.toString(),
      });
      drawBox.draw(canvasElement);

      return {
        _label: bestMatch._label,
        _distance: bestMatch._distance,
        _box: box,
      };
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

async function uploadLabeledImages(
  images,
  label,
  userId,
  gender,
  city,
  age,
  description
) {
  try {
    //Tests

    let scoreThreshold = 0.8;
    inputSize = 512;
    const Option = new faceapi.SsdMobilenetv1Options({
      inputSize,
      scoreThreshold,
    });

    const useTinyModel = true;

    const descriptions = [];
    const userIdCurrent = userId;
    // Loop through the images
    const startTime = new Date();
    for (let i = 0; i < images.length; i++) {
      const img = await canvas.loadImage(images[i]);
      // Read each face and save the face descriptions in the descriptions array
      const detections = await faceapi
        .detectSingleFace(img, Option)
        .withFaceLandmarks(useTinyModel)
        .withFaceDescriptor();
      descriptions.push(detections.descriptor);
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
      INSERT INTO person (name, reported_by, image_path, gender, city, age, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const insertQueryReport = `
      INSERT INTO report (user_id)
      VALUES ($1)
    `;

    const values = [createFace.label, createFace.descriptions, userIdCurrent];
    const valuesPerson = [
      label,
      userIdCurrent,
      address,
      gender,
      city,
      age,
      description,
    ];
    const valuesReport = [userIdCurrent];

    const client = await db.connect();
    await client.query("BEGIN");
    const result = await client.query(insertQuery, values);
    const personUpdate = await client.query(insertQueryPerson, valuesPerson);
    const reportUpdate = await client.query(insertQueryReport, valuesReport);
    await client.query("COMMIT");
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
