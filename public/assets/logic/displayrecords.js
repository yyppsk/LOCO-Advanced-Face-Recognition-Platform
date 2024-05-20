let data = [];
fetch("/fetchAllMissing/")
  .then((response) => response.json())
  .then((fetchedData) => {
    data = fetchedData;
    displayData(data);
  })
  .catch((error) => console.error("Error:", error));

function displayData(data) {
  const gallery = document.querySelector("#gallery");
  gallery.innerHTML = "";
  data.forEach((person) => {
    const div = document.createElement("div");
    const img = document.createElement("img");
    img.className = "h-72 rounded-lg mb-2 object-none object-bottom";

    img.alt = person.name;
    img.src = `${person.image_path}/${person.name}-1.jpg`;

    const dateObj = new Date(person.created_at);

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const readableDate = dateObj.toLocaleDateString("en-US", options);

    const buttonHTML = `
      <button id="contactAgencyButton-${person.person_id}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
        Contact Reporting Agency
      </button>
    `;

    div.appendChild(img);
    div.innerHTML += `
      <h2>${person.name}</h2>
      <p>${person.description}</p>
      <p>Reported by: <span id="${person.reported_by}-${person.person_id}">Click Button to Reveal</span></p>
      <p class="text-pretty">City: ${person.city}</p>
      <p>Gender: ${person.gender}</p>
      <p>Reported at: ${readableDate}</p>
      <br>
      <div class="flex space-x-2">
        <button class="edit-button flex items-center justify-center text-sm md:text-base text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 mr-2 md:mr-4" onclick="openEditModal('${person.person_id}', '${person.name}', '${person.gender}', '${person.age}', '${person.city}', '${person.description}', '${person.reported_by}')">
          <i class="fas fa-edit mr-1"></i> Edit
        </button>
        <button class="delete-button flex items-center justify-center text-sm md:text-base text-red-500 hover:text-red-700 focus:outline-none focus:text-red-700" onclick="openDeleteModal('${person.person_id}')">
          <i class="fas fa-trash-alt mr-1"></i> Delete
        </button>
      </div>
      ${buttonHTML}
    `;
    gallery.appendChild(div);

    document
      .getElementById(`contactAgencyButton-${person.person_id}`)
      .addEventListener("click", () => {
        fetch(`/fetchReportedBy/${person.reported_by}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((reportingAgencyInfo) => {
            const reportedbyEle = document.getElementById(
              `${person.reported_by}-${person.person_id}`
            );
            reportedbyEle.textContent = reportingAgencyInfo.username;
            Swal.fire({
              title: "Reporting Agency Information",
              icon: "success",
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
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Failed to fetch reporting agency information!",
            });
          });
      });
  });
}

document.querySelectorAll(".sort-button").forEach((button) => {
  button.addEventListener("click", () => {
    const sortKey = button.dataset.sort;
    data.sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
    displayData(data);
  });
});

function searchAndDisplay() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  const filteredData = data.filter((person) =>
    person.name.toLowerCase().includes(searchTerm)
  );
  displayData(filteredData);
}

document
  .getElementById("search-button")
  .addEventListener("click", searchAndDisplay);

document.getElementById("search-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchAndDisplay();
  }
});
