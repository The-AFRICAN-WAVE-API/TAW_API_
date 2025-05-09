document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://us-central1-news-api-f1a79.cloudfunctions.net/api";

  async function callCloudFunction() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Response from Cloud Function:", data);
    } catch (error) {
      console.error("Error calling the Cloud Function:", error);
    }
  }

  document.querySelector("button").addEventListener("click", callCloudFunction);
});
