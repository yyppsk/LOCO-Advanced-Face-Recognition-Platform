document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/fetchuserinfo");
    const data = await response.json();
    console.log("hola");
    if (data.length > 0) {
      const user = data[0];
      const name = user.username.split(" ");
      const usernameElement = document.getElementById("account");

      usernameElement.innerHTML = `Hey ${name[0]}!`;
    } else {
      // Handle the case when no user data is returned
      console.error("No user data available.");
    }
  } catch (error) {
    console.error("Error fetching user information:", error);
  }
});
