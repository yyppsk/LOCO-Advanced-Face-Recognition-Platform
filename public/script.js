const uploadForm = document.getElementById("uploadForm");

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(uploadForm);

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});
