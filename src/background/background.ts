import axios from 'axios';
import Vue from 'vue';

Vue.chrome = Vue.prototype.$chrome = chrome || browser;

Vue.chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const headers = typeof request.headers !== 'undefined' ? request.headers : {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
  };

  switch (request.type) {
    case 'get':
      axios.get(request.url, headers)
        .then(response => {
          sendResponse(response.data);
        });
      break;
    case 'post':
      axios.post(request.url, request.data, headers)
        .then(response => {
          sendResponse(response.data);
        });
      break;
  }

  return true;
});
