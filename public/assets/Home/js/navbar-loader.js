// navbar-loader.js
document.addEventListener("DOMContentLoaded", function () {
  const navbarPlaceholder = document.getElementById("navbar-placeholder");

  // Fetch the content of navbar.html
  fetch("/partials/navbar.html")
    .then((response) => response.text())
    .then((html) => {
      // Insert the content into the placeholder
      navbarPlaceholder.innerHTML = html;
    })
    .catch((error) => {
      console.error("Error loading navbar:", error);
    });
});

function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  const currentHeight = window.getComputedStyle(mobileMenu).maxHeight;

  mobileMenu.classList.toggle("hidden");

  if (mobileMenu.classList.contains("hidden")) {
    mobileMenu.style.maxHeight = "0";
  } else {
    mobileMenu.style.maxHeight =
      currentHeight === "0px" ? mobileMenu.scrollHeight + "px" : "0";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/fetchuserinfo"); // Update the URL if necessary
    const data = await response.json();

    if (data.length > 0) {
      const user = data[0]; // Assuming there is only one user in the response
      const usernameElement = document.getElementById("username");
      const emailElement = document.getElementById("email");
      const loginbtn = document.getElementById("loginbtn");
      const signupbtn = document.getElementById("signupbtn");
      const dashlink = document.getElementById("dashlink");
      dashlink.classList.remove("hidden");
      loginbtn.classList.toggle("hidden");
      signupbtn.classList.toggle("hidden");
      // Set the innerHTML of the span elements with the user data
      usernameElement.innerHTML = `Hey ${user.username}`;
      emailElement.innerHTML = user.email;
    } else {
      // Handle the case when no user data is returned
      console.error("No user data available.");
    }
  } catch (error) {
    console.error("Error fetching user information:", error);
  }
});
