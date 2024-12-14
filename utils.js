function resizeImage(file, maxWidth) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scaleFactor = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}


function uploadImageToSimpleFileUpload(imageFile) {
  // Files are deleted frequently - to save files sign up for an account at https://simplefileupload.com/

  const bucketId = localStorage.getItem('simpleFileUploadBucketId') || 'e8557605f1b5ac9b18c913603d29a8c8';
  const url = "https://app.simplefileupload.com/api/v1/file"

  return resizeImage(imageFile, 500).then((resizedFile) => {
    const formData = new FormData();
    formData.append('file', resizedFile);
    formData.append('bucket_id', bucketId);
    // If you want to add tags to the upload to keep everything organized, you can add them here.
    // formData.append('tags', 'user_image');
    return fetch(url, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.data.attributes['ai-url']) {
          return data.data.attributes['ai-url'];
        } else {
          throw new Error('No AI URL in the response');
        }
      })
      .catch(error => {
        console.error('Error uploading to Simple File Upload:', error);
        throw error;
      });
  });
}

function showSettings() {
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('settingsContent').style.display = 'block';
}

function hideSettings() {
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('settingsContent').style.display = 'none';
}

function toggleSettings() {
  const settingsContent = document.getElementById('settingsContent');
  if (settingsContent.style.display === 'none') {
    showSettings();
  } else {
    hideSettings();
  }
}

// Add these functions at the end of the file
function getStorageItem(key) {
  return localStorage.getItem(key);
}

function setStorageItem(key, value) {
  localStorage.setItem(key, value);
}
