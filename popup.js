const fetchButton = document.getElementById('fetchUrls');
const copyButton = document.getElementById('copyUrls');
const urlListElement = document.getElementById('urlList');
const statusElement = document.getElementById('status');
const darkModeToggle = document.getElementById('darkModeToggle');

chrome.storage.sync.get(['darkModeEnabled'], (result) => {
  if (result.darkModeEnabled) {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
  }
});

darkModeToggle.addEventListener('change', () => {
  const darkModeEnabled = darkModeToggle.checked;
  document.body.classList.toggle('dark-mode', darkModeEnabled);
  chrome.storage.sync.set({ darkModeEnabled });
});

fetchButton.addEventListener('click', async () => {
  urlListElement.innerHTML = '';
  statusElement.textContent = 'Fetching URLs...';
  copyButton.disabled = true;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      { target: { tabId: tabs[0].id }, files: ['content.js'] },
      () => {
        chrome.tabs.sendMessage(tabs[0].id, 'getPageUrls', (urls) => {
          if (chrome.runtime.lastError) {
            statusElement.textContent = 'Error fetching URLs.';
            return;
          }

          if (urls && urls.length > 0) {
            urls.forEach(url => {
              const listItem = document.createElement('li');
              listItem.textContent = url;
              urlListElement.appendChild(listItem);
            });
            statusElement.textContent = `${urls.length} URLs found.`;
            copyButton.disabled = false;
            copyButton.dataset.urls = urls.join('\n');
          } else {
            statusElement.textContent = 'No URLs found on this page.';
          }
        });
      }
    );
  });
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.urls);
    statusElement.textContent = 'URLs copied to clipboard!';
  } catch (error) {
    statusElement.textContent = 'Failed to copy URLs. Try again.';
  }
});
