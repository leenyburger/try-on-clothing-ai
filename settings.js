document
  .getElementById('settingsForm')
  .addEventListener('submit', function (e) {
    e.preventDefault();
    const openAIApiKey = document.getElementById('openAIApiKey').value;
    const replicateApiToken = document.getElementById('replicateApiToken').value;
    const simpleFileUploadBucketId = document.getElementById('simpleFileUploadBucketId').value;

    localStorage.setItem('openAIApiKey', openAIApiKey);
    localStorage.setItem('replicateApiToken', replicateApiToken);
    localStorage.setItem('simpleFileUploadBucketId', simpleFileUploadBucketId);

    document.getElementById('saveSettings').innerHTML = 'Saved';
    setTimeout(() => {
      if (openAIApiKey && replicateApiToken) {
        hideSettings();
      }
    }, 1000);
  });

// Populate form with existing values
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('openAIApiKey').value =
    localStorage.getItem('openAIApiKey') || '';
  document.getElementById('replicateApiToken').value =
    localStorage.getItem('replicateApiToken') || '';
  document.getElementById('simpleFileUploadBucketId').value =
    localStorage.getItem('simpleFileUploadBucketId') || '';
});
