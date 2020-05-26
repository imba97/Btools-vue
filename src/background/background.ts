import axios from 'axios';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const headers = typeof request.headers !== 'undefined' ? request.headers : {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
  };

  switch (request.type) {
    case 'get':
      sendResponse(axios.get(request.url, headers));
    case 'post':
      sendResponse(axios.post(request.url, request.data, headers));
  }

  return true;
});
