// Define functions to open modals for editing and deleting records
function openEditModal(personId, name, gender, age, city, description) {
  Swal.fire({
    title: "Edit Person",
    html: `
  <input id="edit-name" class="swal2-input" value="${name}" placeholder="Name">
  <input id="edit-gender" class="swal2-input" value="${gender}" placeholder="Gender">
  <input id="edit-age" class="swal2-input" value="${age}" placeholder="Age">
  <input id="edit-city" class="swal2-input" value="${city}" placeholder="City">
  <input id="edit-description" class="swal2-input" value="${description}" placeholder="Description">
`,
    focusConfirm: false,
    showDenyButton: true,
    showCancelButton: true,
    denyButtonText: `Don't save`,
    preConfirm: () => {
      const name = document.getElementById("edit-name").value;
      const gender = document.getElementById("edit-gender").value;
      const age = document.getElementById("edit-age").value;
      const city = document.getElementById("edit-city").value;
      const description = document.getElementById("edit-description").value;
      editPerson(personId, name, gender, age, city, description);
    },
  });
}

function openDeleteModal(personId) {
  Swal.fire({
    title: "Delete Person",
    text: "Are you sure you want to delete this person?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      deletePerson(personId);
    } else if (result.isDenied) {
      Swal.fire("Changes are not saved", "", "info");
    }
  });
}

// Function to send edit/update request to the server
async function editPerson(personId, name, gender, age, city, description) {
  try {
    const response = await fetch(`/persons/${personId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        gender,
        age,
        city,
        description,
      }),
    });
    const data = await response.json();
    if (data.success) {
      Swal.fire("Success", data.message, "success");
      // You can refresh the page or update the UI as needed after successful update
    } else {
      Swal.fire("Error", data.message, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire("Error", "An error occurred while updating the record", "error");
  }
}

// Function to send delete request to the server
async function deletePerson(personId) {
  try {
    const response = await fetch(`/persons/${personId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.success) {
      Swal.fire("Success", data.message, "success");
      // You can refresh the page or update the UI as needed after successful deletion
    } else {
      Swal.fire("Error", data.message, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire("Error", "An error occurred while deleting the record", "error");
  }
}

// Use JavaScript to fetch and populate data
async function fetchDataAndPopulateCards() {
  try {
    const response = await fetch("/dashboardfetch"); // Replace with your server route to fetch data
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const cardsContainer = document.getElementById("cards-container");

    data.forEach((person) => {
      const wrapper = document.createElement("div");
      const card = document.createElement("div");
      wrapper.appendChild(card);
      card.className =
        "bg-white rounded-lg p-4 shadow-lg cursor-pointer flex-row";
      card.innerHTML = `<img src="${person.image_path}${person.name}-1.jpg" alt="${person.name}'s Image" class="w-full h-60 object-scale-down mt-4">`;
      card.setAttribute("onclick", `navigateToProfile('${person.person_id}')`);
      const information = document.createElement("div");

      information.className = "information";
      information.innerHTML = `
          <h3 class="text-xl font-semibold">${person.name}</h3>
          <p class="text-gray-600">Gender: ${
            person.gender != null ? person.gender : "Unknown"
          }</p>
          <p class="text-gray-600">City: ${
            person.city != null ? person.city : "Unknown"
          }</p>
          <p class="text-gray-600">Age: ${
            person.age != null ? person.age : "Unknown"
          }</p>
          <p class="text-gray-600">Created on: ${new Date(
            person.created_at
          ).toDateString()}</p>
          <p class="text-gray-600" data-person-id="${
            person.person_id
          }">Person ID: ${person.person_id}</p>
         
          <div class="flex">
          <button class="edit-button flex items-center justify-center text-sm md:text-base text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 mr-2 md:mr-4" onclick="openEditModal('${
            person.person_id
          }', '${person.name}', '${person.gender}', '${person.age}', '${
        person.city
      }', '${person.description}', '${person.reported_by}')">
            <i class="fas fa-edit mr-1"></i> Edit
          </button>
          <button class="delete-button flex items-center justify-center text-sm md:text-base text-red-500 hover:text-red-700 focus:outline-none focus:text-red-700" onclick="openDeleteModal('${
            person.person_id
          }')">
            <i class="fas fa-trash-alt mr-1"></i> Delete
          </button>
        </div>

          `;

      card.appendChild(information);
      cardsContainer.appendChild(wrapper);
    });
  } catch (error) {
    console.error(error);
    // Handle errors here
  }
}

// Function to navigate to profile page
function navigateToProfile(personId) {
  // You can implement the navigation logic here
  // For now, let's log the person ID
  console.log("Navigating to profile of person with ID:", personId);
}

// Call the function to fetch and populate data when the page loads
window.addEventListener("load", fetchDataAndPopulateCards);
