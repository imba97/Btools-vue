chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case 'get':
      fetch(request.url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
        }
      })
        .then(response => { return response.json(); })
        .then(json => { sendResponse(json); })
        .catch(error => { sendResponse(error); });
      return true;
  }
});
