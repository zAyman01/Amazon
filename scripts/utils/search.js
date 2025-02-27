document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  if (!searchInput || !searchButton) {
    console.error("Search input or button not found.");
    return;
  }

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `amazon.html?search=${encodeURIComponent(query)}`;
    }
  });

  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      searchButton.click();
    }
  });
});
