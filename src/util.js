export function makeRequest(
  url,
  responseType = "text",
  method = "GET",
  data = null,
  headers = {},
  timeout = 0
) {
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = timeout;
    xhr.responseType = responseType;
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        resolve(this.response);
      } else {
        reject({
          status: this.status,
          response: this.response
        });
      }
    };
    xhr.onerror = function() {
      reject({
        status: this.status,
        response: this.response
      });
    };
    for (let name in headers) {
      xhr.setRequestHeader(name, headers[name]);
    }
    xhr.send(data);
  });
}
