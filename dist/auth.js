$(function() {
  var token;
  token = /token=([^&]+)/i.exec(location.href);
  if (token) {
    chrome.runtime.sendMessage({
      v: "set_config",
      key: 'token',
      value: token[1]
    });
    return window.close();
  }
});

/*
//@ sourceMappingURL=auth.js.map
*/