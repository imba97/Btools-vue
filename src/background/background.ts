import axios from 'axios';
import Vue from 'vue';

Vue.chrome = Vue.prototype.$chrome = chrome || browser;

Vue.chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  const params = request.type === 'GET' ? { params: request.params } : { data: request.data }

  axios({
    method: request.type,
    url: request.url,
    ...params,
    headers: request.headers || {}
  })
    .then(response => {
      sendResponse(response.data)
    });

  return true;
});
