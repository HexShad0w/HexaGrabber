const links = [...new Set(Array.from(document.querySelectorAll('a')).map(link => link.href).filter(Boolean))];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'getPageUrls') {
    sendResponse(links);
  }
});
