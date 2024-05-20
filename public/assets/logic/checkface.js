const fileInput = document.getElementById("checkImg");
const imagePreview = document.getElementById("imagePreview");

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      imagePreview.src = imageUrl;
    };
    reader.readAsDataURL(file);
  }
});

document.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  try {
    console.log("formData:", formData); // Add this log
    const response = await fetch("/check-face", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Response data:", data); // Add this log
    const canvas = document.getElementById("overlay"); // Get the canvas element
    console.log("Canvas element:", canvas); // Add this log

    const context = canvas.getContext("2d");

    // Clear the previous drawings
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Load the image
    const img = new Image();
    img.src = URL.createObjectURL(formData.get("checkImg"));
    console.log("Image source:", img.src);

    img.onload = () => {
      console.log("Image loaded");
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      data.result.forEach((match) => {
        const label = match._label;
        const distance = match._distance;
        const box = match._box;
        const id = match._id;

        // Draw bounding box
        context.beginPath();
        context.rect(box._x, box._y, box._width, box._height);
        context.lineWidth = 4;
        context.strokeStyle = "red";
        context.fillStyle = "red";
        context.stroke();

        // Set the font size for the label
        context.font = "20px Arial"; // Increase the pixel size as needed
        context.fillText(`Label: ${label}`, box._x, box._y - 10);

        const resultItem = document.createElement("p");
        if (label == "unknown") {
          resultItem.setAttribute(
            "style",
            `
background-color: rgba(255, 0, 0, 0.2);
transition: background-color 0.3s ease;
`
          );
          resultItem.textContent = `Person is not found in our database, or try diferent image.`;
        } else {
          // Display basic information
          resultItem.textContent = `ID: ${id} - Name: ${label}`;
          // Fetch additional information
          fetch(`/fetchUserInfobyid/${id}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((data) => {
              const cityLink = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                data.city
              )}" target="_blank" style="color:blue">${data.city}</a>`;

              // Create button HTML using Tailwind CSS classes
              const buttonHTML = `
              <button id="contactAgencyButton-${id}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
                Contact Reporting Agency
              </button>
            `;

              // Set innerHTML of resultItem to include cityLink and buttonHTML
              resultItem.innerHTML = `
              ID: ${data.person_id} - Name: ${data.name}<br>
              Gender: ${data.gender}<br>
              Age: ${data.age}<br>
              Address: ${cityLink}<br>
              Reported by: ${data.reported_by}<br>
              Created at: ${new Date(data.created_at).toLocaleString()}<br>
              ${buttonHTML}
            `;

              // Handle click event on the Contact Agency button
              document
                .getElementById(`contactAgencyButton-${id}`)
                .addEventListener("click", () => {
                  // Trigger fetch request to fetch information about the reported agency
                  fetch(`/fetchReportedBy/${data.reported_by}`)
                    .then((response) => {
                      if (!response.ok) {
                        throw new Error("Network response was not ok");
                      }
                      return response.json();
                    })
                    .then((reportingAgencyInfo) => {
                      // Display information in SweetAlert modal
                      Swal.fire({
                        title: "Reporting Agency Information",
                        html: `
                        <p>Username: ${reportingAgencyInfo.username}</p>
                        <p>Email: ${reportingAgencyInfo.email}</p>
                        <p>Phone Number: ${reportingAgencyInfo.mobile}</p>
                      `,
                      });
                    })
                    .catch((error) => {
                      console.error(
                        "Error fetching reporting agency information:",
                        error
                      );
                      // Display error message in SweetAlert modal
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Failed to fetch reporting agency information!",
                      });
                    });
                });
            });
        }
        // Append the result to the result div
        document.getElementById("result").appendChild(resultItem);
      });
    };
  } catch (error) {
    console.error("Error:", error.message);
  }
});
