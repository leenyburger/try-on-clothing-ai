document.addEventListener('DOMContentLoaded', function () {
  const tryOnButton = document.getElementById('tryOn');
  const resultDiv = document.getElementById('result');
  const loader = document.getElementById('loader');
  const loadingMessage = document.getElementById('loadingMessage');
  const personImageInput = document.getElementById('personImage');
  const cachedImagesDiv = document.getElementById('cachedImages');

  let selectedImageUrl = null;

  // Load and display cached images
  loadCachedImages();

  // Load and display last result
  loadLastResult();

  // Create and append the upload new image button
  const uploadNewImage = document.createElement('label');
  uploadNewImage.id = 'uploadNewImage';
  uploadNewImage.textContent = '+';
  uploadNewImage.setAttribute('for', 'personImage');
  cachedImagesDiv.appendChild(uploadNewImage);

  personImageInput.addEventListener('change', function () {
    if (this.files.length > 0) {
      const file = this.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadNewImage.innerHTML = `
          <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
          <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; color: white; text-shadow: 0 0 3px rgba(0,0,0,0.5);">+</span>
        `;
      };
      reader.readAsDataURL(file);
      tryOnButton.disabled = false;
      selectedImageUrl = null;
      // Deselect any previously selected cached image
      document
        .querySelectorAll('.cached-image')
        .forEach((img) => img.classList.remove('selected'));
    } else {
      resetUploadButton();
      tryOnButton.disabled = !selectedImageUrl;
    }
  });

  tryOnButton.addEventListener('click', function () {
    if (selectedImageUrl) {
      console.log('Using selected image URL:', selectedImageUrl);
      startVirtualTryOn(selectedImageUrl);
    } else if (personImageInput.files.length > 0) {
      console.log('Uploading new image file');
      const personImageFile = personImageInput.files[0];
      uploadImageToSimpleFileUpload(personImageFile)
        .then((personImageUrl) => {
          console.log('Image uploaded successfully:', personImageUrl);
          const newCachedImage = cacheImage(personImageUrl);
          selectCachedImage(newCachedImage, personImageUrl);
          startVirtualTryOn(personImageUrl);
          resetUploadButton();
        })
        .catch((error) => {
          console.error('Error uploading image:', error);
          showError('Error: ' + error.message);
        });
    } else {
      console.log('No image selected');
      alert('Please select an image or upload a new one.');
    }
  });

  function resetUploadButton() {
    uploadNewImage.innerHTML = '<span style="font-size: 24px;">+</span>';
  }

  function startVirtualTryOn(personImageUrl) {
    loader.style.display = 'block';
    loadingMessage.style.display = 'block';
    resultDiv.textContent = '';
    tryOnButton.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentPageUrl = tabs[0].url; // Get the current page URL
      const openAIApiKey = localStorage.getItem('openAIApiKey');
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ['content.js'],
        },
        () => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'getProductImage', openAIApiKey: openAIApiKey },
            function (response) {
              if (response && response.productImageUrl) {
                performVirtualTryOn(
                  personImageUrl,
                  response.productImageUrl,
                  currentPageUrl
                );
              } else {
                showError("Couldn't find product image.");
              }
            }
          );
        }
      );
    });
  }

  function loadCachedImages() {
    const cachedUrls = JSON.parse(
      localStorage.getItem('cachedImageUrls') || '[]'
    );
    cachedUrls.forEach((url) => {
      const imgContainer = document.createElement('div');
      imgContainer.classList.add('image-container');

      const img = document.createElement('img');
      img.src = url;
      img.classList.add('cached-image');
      img.addEventListener('click', () => selectCachedImage(img, url));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.classList.add('delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCachedImage(url, imgContainer);
      });

      imgContainer.appendChild(img);
      imgContainer.appendChild(deleteBtn);
      cachedImagesDiv.appendChild(imgContainer);
    });
  }

  function deleteCachedImage(url, imgContainer) {
    // Remove from localStorage
    const cachedUrls = JSON.parse(
      localStorage.getItem('cachedImageUrls') || '[]'
    );
    const updatedUrls = cachedUrls.filter((cachedUrl) => cachedUrl !== url);
    localStorage.setItem('cachedImageUrls', JSON.stringify(updatedUrls));

    // Remove from DOM
    cachedImagesDiv.removeChild(imgContainer);

    // Reset selection if the deleted image was selected
    if (selectedImageUrl === url) {
      selectedImageUrl = null;
      tryOnButton.disabled = true;
    }
  }

  function selectCachedImage(imgElement, url) {
    document
      .querySelectorAll('.cached-image')
      .forEach((img) => img.classList.remove('selected'));
    imgElement.classList.add('selected');
    selectedImageUrl = url;
    tryOnButton.disabled = false;
    personImageInput.value = '';
    resetUploadButton();
  }

  function cacheImage(url) {
    const cachedUrls = JSON.parse(
      localStorage.getItem('cachedImageUrls') || '[]'
    );
    if (!cachedUrls.includes(url)) {
      cachedUrls.unshift(url);
      if (cachedUrls.length > 5) cachedUrls.pop(); // Keep only the last 5 images
      localStorage.setItem('cachedImageUrls', JSON.stringify(cachedUrls));

      const imgContainer = document.createElement('div');
      imgContainer.classList.add('image-container');

      const img = document.createElement('img');
      img.src = url;
      img.classList.add('cached-image');
      img.addEventListener('click', () => selectCachedImage(img, url));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.classList.add('delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCachedImage(url, imgContainer);
      });

      imgContainer.appendChild(img);
      imgContainer.appendChild(deleteBtn);
      cachedImagesDiv.insertBefore(imgContainer, uploadNewImage);

      if (cachedImagesDiv.querySelectorAll('.image-container').length > 5) {
        cachedImagesDiv.removeChild(
          cachedImagesDiv.children[cachedImagesDiv.children.length - 2]
        );
      }

      return img; // Return the newly created image element
    }
    return null;
  }

  function showError(message) {
    loader.style.display = 'none';
    loadingMessage.style.display = 'none';
    resultDiv.innerHTML = message;
    tryOnButton.disabled = false;
  }
// This returns a URL you have to get from Replicate
  function performVirtualTryOn(personImageUrl, productImageUrl, currentPageUrl) {
    const replicateApiToken = localStorage.getItem('replicateApiToken');
    if (!replicateApiToken) {
      showError('Replicate API token is missing. Please set it in the settings.');
      return;
    }

    const payload = {
      version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
      input: {
        "crop": false,
        "seed": 42,
        "steps": 30,
        "category": "upper_body",
        "force_dc": false,
        "garm_img": productImageUrl,
        "human_img": personImageUrl,
        "mask_only": false,
        "garment_des": "cute pink top"
        }
      }
    console.log('Sending request to Replicate API:', payload);

    fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${replicateApiToken}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      response.json().then((data) => {

        console.log('Replicate API response:', data);
        const getUrl = data.urls.get;
        listenForResult(getUrl, productImageUrl, currentPageUrl);
      });
    })
    .catch((error) => {
      console.error('Error in virtual try-on process:', error);
      showError(`Could not perform virtual try-on. Error: ${error.message}`);
    });
}

  function listenForResult(getUrl, productImageUrl, currentPageUrl) {
    const replicateApiToken = localStorage.getItem('replicateApiToken');
    if (!replicateApiToken) {
      showError('Replicate API token is missing. Please set it in the settings.');
      return;
    }

    const startTime = Date.now();
    const timeout = 120000; // 1 minute timeout

    function checkResult() {
      if (Date.now() - startTime > timeout) {
        showError('Virtual try-on timed out after 2 minutes. Please try again.');
        return;
      }

      fetch(getUrl, {
        headers: {
          'Authorization': `Bearer ${replicateApiToken}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log('API response:', data);

          if (data.status === 'succeeded') {
            if (data.output) {
              // If you want to save this file, you can save it to Simple File Upload with the same method we use for the person's image. 
              // You can add a tag to the upload to indicate it's a try-on result. If you will be showing the image to the user, use the "cdn-url" in the response.
              const resultUrl = data.output;
              if (chrome.storage && chrome.storage.local) {
                const cacheData = {};
                cacheData[currentPageUrl] = resultUrl;
                chrome.storage.local.set(cacheData, function () {
                  console.log('Result cached for', currentPageUrl);
                });
              }
              displayResult(resultUrl);
            } else {
              showError('Virtual try-on completed, but no output was generated.');
            }
          } else if (data.status === 'failed') {
            showError(`Virtual try-on failed: ${data.error || 'Unknown error'}`);
          } else {
            // Job is still processing, check again after a delay
            setTimeout(checkResult, 2000);  // Check every 2 seconds
          }
        })
        .catch(error => {
          showError('Error: ' + error.message);
          console.error('Error in virtual try-on process:', error);
        });
    }

    checkResult();  // Start checking
  }

  function loadLastResult() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentPageUrl = tabs[0].url; // Get the current page URL
      chrome.storage.local.get([currentPageUrl], function (result) {
        if (result[currentPageUrl]) {
          displayResult(result[currentPageUrl]);
        }
      });
    });
  }

  function displayResult(resultUrl) {
    loader.style.display = 'none';
    loadingMessage.style.display = 'none';
    const img = document.createElement('img');
    img.src = resultUrl;
    img.style.maxWidth = '100%';
    resultDiv.innerHTML = '';
    resultDiv.appendChild(img);
  }

  const settingsButton = document.getElementById('settingsButton');
  settingsButton.addEventListener('click', toggleSettings);

  checkAndShowSettings();

  function checkAndShowSettings() {
    const openAIApiKey = localStorage.getItem('openAIApiKey');
    const replicateApiToken = localStorage.getItem('replicateApiToken');
    const simpleFileUploadApiKey = localStorage.getItem('simpleFileUploadApiKey');
    if (!openAIApiKey || !cloudName || !uploadPreset) {
      showSettings();
    }
  }

  chrome.storage.local.clear(function () {
    console.log('Storage cleared');
  });
});
