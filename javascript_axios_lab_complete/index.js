import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");

// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const baseUrl = "https://api.thecatapi.com/v1";
const API_KEY =
  "live_bTSnX965dgdL4Hh0SHpdnMvh7S9VgETvwEQFIZqDmpw8nUYblYNKMUHKRbiYcoC6"; // Replace with your actual API key

// Axios configuration
axios.defaults.baseURL = baseUrl;
axios.defaults.headers.common["x-api-key"] = API_KEY;

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using Axios.
 * - Create new <options> for each of these breeds and append them to breedSelect.
 *   - Each option should have a value attribute equal to the id of the breed.
 *   - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */
async function initialLoad() {
  try {
    // Fetch the list of breeds from the API using Axios
    const response = await axios.get("/breeds");

    // Check if the response is successful
    if (response.status === 200) {
      const breeds = response.data;

      // Clear the breedSelect
      breedSelect.innerHTML = "";

      // Create an empty option as the default option
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select a Breed";
      breedSelect.appendChild(defaultOption);

      // Create new options for each breed and append them to breedSelect
      breeds.forEach((breed) => {
        const option = document.createElement("option");
        option.value = breed.id;
        option.textContent = breed.name;
        breedSelect.appendChild(option);
      });

      // Call the event handler for breedSelect
      breedSelect.addEventListener("change", handleBreedSelection);
    }
  } catch (error) {
    console.error("Error loading breeds:", error);
  }
}

// Call initialLoad to execute it immediately
initialLoad();

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using Axios.
 * - Make sure your request is receiving multiple array items!
 * - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *   - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 * - Be creative with how you create DOM elements and HTML.
 * - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 * - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */
async function handleBreedSelection() {
  const selectedBreedId = breedSelect.value;

  try {
    // Fetch information about the selected breed using Axios
    const response = await axios.get(
      `/images/search?breed_ids=${selectedBreedId}&limit=10`
    );

    if (response.status === 200) {
      const breedInfo = response.data;

      // Clear the carousel and infoDump
      Carousel.clear();

      // Process the data and populate the carousel and infoDump
      breedInfo.forEach((info) => {
        const carouselItem = Carousel.createCarouselItem(
          info.url,
          info.breeds[0].name,
          info.id
        );
        Carousel.appendCarousel(carouselItem);

        const infoElement = createInfoElement(info.breeds[0]);
        infoDump.appendChild(infoElement);
        infoDump.style.border = "10px solid red;";
      });

      // Restart the Carousel
      Carousel.start();
    }
  } catch (error) {
    console.error("Error loading breed information:", error);
  }
}

function createInfoElement(breedInfo) {
  // Create and return an informational section within the infoDump element
  const infoElement = document.createElement("div");
  infoElement.classList.add("info-border");
  infoElement.innerHTML = `
    <h2>${breedInfo.name}</h2>
    <p>Description: ${breedInfo.description}</p>
    <p>Origin: ${breedInfo.origin}</p>
  `;
  return infoElement;
}

// 5. Add Axios interceptors to log the time between request and response to the console.
// Add an Axios request interceptor to log the start of requests
axios.interceptors.request.use((config) => {
  // Create a metadata object within the config object and store the start time
  config.metadata = { startTime: new Date().getTime() };
  // 6. Set the width of the progressBar to 0% to reset the progress
  progressBar.style.width = "0%";
  // 7. Set cursor to "progress"
  document.body.style.cursor = "progress";
  // You can also log additional information to the console:
  console.log(
    `Request started at ${new Date(config.metadata.startTime).toISOString()}`
  );
  return config;
});

// 6. Function to update the progress of the request
function updateProgress(event) {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    progressBar.style.width = percentComplete + "%";
    console.log("ProgressEvent object:", event);
  }
}

// 6. Add the 'updateProgress' function to the 'onDownloadProgress' option
axios.defaults.onDownloadProgress = updateProgress;

// Add an Axios response interceptor to log the time between request and response
axios.interceptors.response.use((response) => {
  const endTime = new Date().getTime();
  console.log(`Response received at ${new Date(endTime).toISOString()}`);
  console.log("Config data:", response);
  const timeDifference = endTime - response.config.metadata.startTime;
  console.log(`Time taken: ${timeDifference} ms`);
  // 6. Reset the progress bar to 100% upon response
  progressBar.style.width = "100%";
  // 7. Set cursor to "default"
  document.body.style.cursor = "default";
  return response;
});

/**
 * 8. To practice posting data, we'll create a system to "favorite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *   - This is why we use the export keyword for this function.
 * - Post to the cat API's favorites endpoint with the given ID.
 * - Add additional logic to this function such that if the image is already favorited,
 *   you delete that favorite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

let subId = "user-125";
export async function favourite(imgId) {
  try {
    // Check if the image is already favorited using Axios
    const existingFavorites = await axios.get("/favourites", {
      params: {
        sub_id: subId
      }
    });
    console.log("Favorite data:", existingFavorites);
    console.log("image iD:", imgId);

    if (existingFavorites.status === 200) {
      const favorites = existingFavorites.data;
      const isFavorited = favorites.some((fav) => fav.image.id === imgId);

      if (isFavorited) {
        // If already favorited, remove the favorite
        const deleteFavourites = existingFavorites.data.find(
          (fav) => fav.image.id === imgId
        );
        // If already favorited, remove the favorite using Axios
        const response = await axios.delete(
          `/favourites/${deleteFavourites.id}`
        );
        if (response.status === 200) {
          // Success - Remove the favorite
          console.log("Removed favorite image.");
        } else {
          console.error(
            "Failed to remove favorite image:",
            response.status,
            response.data
          );
        }
      } else {
        // Data to for favorite images
        const rawBody = JSON.stringify({
          image_id: imgId,
          sub_id: subId
        });
        // If not favorited, add as a favorite using Axios
        const response = await axios.post("/favourites", rawBody, {
          headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json"
          }
        });
        if (response.status === 200) {
          // Success - Add as a favorite
          console.log("Added favorite image.");
        } else {
          console.error(
            "Failed to add favorite image:",
            response.status,
            response.data
          );
        }
      }
    } else {
      console.error(
        "Failed to fetch existing favorites:",
        existingFavorites.status,
        existingFavorites.data
      );
    }
  } catch (error) {
    console.error("Error favoriting image:", error);
  }
}
/**
 * 9. Test your favorite() function by creating a getFavorites() function.
 * - Use Axios to get all of your favorites from the cat API.
 * - Clear the carousel and display your favorites when the button is clicked.
 */
async function getFavourites() {
  try {
    // Fetch your favorites from the cat API using Axios
    const response = await axios.get("/favourites", {
      params: {
        sub_id: subId // Replace with your user's sub_id
      }
    });

    if (response.status === 200) {
      const favourites = response.data;
      console.log("Get Favourites data:", favourites);

      // Clear the carousel
      Carousel.clear();

      // Display your favorites in the carousel
      favourites.forEach((favourite) => {
        const carouselItem = Carousel.createCarouselItem(
          favourite.image.url,
          "Favorite",
          favourite.image_id
        );
        Carousel.appendCarousel(carouselItem);
      });

      // Restart the Carousel
      Carousel.start();
    }
  } catch (error) {
    console.error("Error getting favorites:", error);
  }
}

// Add an event listener to the "Get Favorites" button
getFavouritesBtn.addEventListener("click", getFavourites);
