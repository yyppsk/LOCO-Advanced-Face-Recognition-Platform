const loginFormId = document.getElementById("loginForm");
loginFormId.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Create a new FormData object and append the form fields
  const formData = new FormData();
  formData.append("loginemail", document.getElementById("loginemail").value);
  formData.append(
    "loginpassword",
    document.getElementById("loginpassword").value
  ); // Log the form data values to the console
  formData.forEach((value, key) => {
    console.log(key, value);
  });

  try {
    const response = await fetch("/login", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      // Redirect to a dashboard or home page on successful login
      window.location.href = "/dashboard";
    } else {
      // Display an error message using SweetAlert
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: result.message,
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: "An internal server error occurred.",
    });
  }
});

document
  .getElementById("signupForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    // Log the form data values for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    console.log("Event Target:", event.target);
    try {
      console.log("Form Data:", formData); // Log form data for debugging
      const response = await fetch("/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Registration was successful, redirect to the home page
        swal.fire({
          icon: "success",
          title: "Registration Succesfull",
        });

        window.location.href = "/";
      } else {
        // Registration failed, show error notification
        swal.fire({
          icon: "error",
          title: "Registration Error",
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
loginButton.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  loginButton.classList.add("text-blue-500");
  signupButton.classList.remove("text-blue-500");
});

signupButton.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  signupButton.classList.remove("text-gray-500");
  signupButton.classList.add("text-blue-500");
  loginButton.classList.remove("text-blue-500");
});
