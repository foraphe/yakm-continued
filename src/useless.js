import "./useless.css";

export function json2dom(json) {
  if (typeof json === "string") {
    let dom = document.createElement("span");
    dom.classList.add("json-string");
    dom.innerText = json;
    return dom;
  }
  if (typeof json === "number") {
    let dom = document.createElement("span");
    dom.classList.add("json-number");
    dom.innerText = String(json);
    return dom;
  }
  if (typeof json === "boolean") {
    let dom = document.createElement("span");
    dom.classList.add("json-boolean");
    dom.innerText = String(json);
    return dom;
  }
  if (json instanceof Array) {
    let dom = document.createElement("ul");
    dom.classList.add("json-object");
    for (let index = 0; index < json.length; ++index) {
      let dpair = document.createElement("li");
      dpair.classList.add("json-array-pair");
      let dkey = document.createElement("span");
      dkey.classList.add("json-array-pair-key");
      dkey.innerText = String(index);
      dpair.appendChild(dkey);
      let dval = json2dom(json[index]);
      if (dval) {
        dval.classList.add("json-array-pair-val");
        dpair.appendChild(dval);
      }
      dom.appendChild(dpair);
    }
    if (dom.childElementCount === 0) {
      let ocp = document.createElement("div");
      ocp.classList.add("json-array-empty");
      ocp.innerText = "[]";
      return ocp;
    }
    return dom;
  }
  if (json instanceof Object) {
    let dom = document.createElement("ul");
    dom.classList.add("json-object");
    for (let key in json) {
      let dpair = document.createElement("li");
      dpair.classList.add("json-object-pair");
      let dkey = document.createElement("span");
      dkey.classList.add("json-object-pair-key");
      dkey.innerText = key;
      dpair.appendChild(dkey);
      let dval = json2dom(json[key]);
      if (dval) {
        dval.classList.add("json-object-pair-val");
        dpair.appendChild(dval);
      }
      dom.appendChild(dpair);
    }
    if (dom.childElementCount === 0) {
      let ocp = document.createElement("div");
      ocp.classList.add("json-object-empty");
      ocp.innerText = "{}";
      return ocp;
    }
    return dom;
  }
}
