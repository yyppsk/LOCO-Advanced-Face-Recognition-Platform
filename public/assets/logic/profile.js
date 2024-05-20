document.addEventListener("DOMContentLoaded", () => {
  // Fetch user info and populate profile details
  fetch("/fetchuserinfo")
    .then((response) => response.json())
    .then((data) => {
      const user = data[0]; // Assuming the API returns an array with one user object
      // Populate profile details
      document.getElementById("user").innerText = user.username;
      document.getElementById("user-email").innerText = user.email;
      document.getElementById("mobile").innerText = user.mobile;
      document.getElementById("username-detail").innerText = user.username;
      document.getElementById("email-detail").innerText = user.email;
      document.getElementById("mobile-detail").innerText = user.mobile;
      document.getElementById("created-at").innerText = new Date(
        user.created_at
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Add verification symbol based on is_verified property
      const isVerifiedElement = document.getElementById("is-verified");
      if (user.is_verified) {
        isVerifiedElement.innerHTML =
          '<i class="fas fa-check-circle text-green-500"></i> Yes';
      } else {
        isVerifiedElement.innerHTML =
          '<i class="fas fa-exclamation-circle text-yellow-500"></i> No';
      }
    })
    .catch((error) => console.error("Error fetching user info:", error));

  // Add event listener for edit profile button
  document
    .getElementById("edit-profile-button")
    .addEventListener("click", () => {
      const editProfileModal = new Modal(
        document.getElementById("editProfileModal")
      );
      editProfileModal.show();

      // Pre-fill the form with current user details
      document.getElementById("editUsername").value =
        document.getElementById("username-detail").innerText;
      document.getElementById("editEmail").value =
        document.getElementById("email-detail").innerText;
      document.getElementById("editMobile").value =
        document.getElementById("mobile-detail").innerText;
    });

  // Add event listener for save changes button
  document
    .getElementById("save-changes-button")
    .addEventListener("click", () => {
      const username = document.getElementById("editUsername").value;
      const email = document.getElementById("editEmail").value;
      const password = document.getElementById("editPassword").value;
      const mobile = document.getElementById("editMobile").value;

      // Prepare data to be sent in the request body
      const userData = { username, email, password, mobile };

      // Send a PUT request to update the user info
      fetch("/updateuserinfo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Update the displayed profile details
            document.getElementById("user").innerText = username;
            document.getElementById("user-email").innerText = email;
            document.getElementById("mobile").innerText = mobile;
            document.getElementById("username-detail").innerText = username;
            document.getElementById("email-detail").innerText = email;
            document.getElementById("mobile-detail").innerText = mobile;

            // Close the modal
            const editProfileModal = new Modal(
              document.getElementById("editProfileModal")
            );
            editProfileModal.hide();

            // Show success message
            Swal.fire({
              icon: "success",
              title: "Profile Updated",
              text: "Your profile information has been updated successfully.",
            });
          } else {
            // Show error message
            Swal.fire({
              icon: "error",
              title: "Update Failed",
              text: data.message || "Failed to update profile information.",
            });
          }
        })
        .catch((error) => {
          console.error("Error updating profile info:", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        });
    });

  // Add event listener for cancel changes button
  document
    .getElementById("cancel-changes-button")
    .addEventListener("click", () => {
      const editProfileModal = new Modal(
        document.getElementById("editProfileModal")
      );
      editProfileModal.hide();
    });
});
