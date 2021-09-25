"use strict";

const ORIGIN = "http://couchers-dev-assets.s3.us-east-1.amazonaws.com"

const http = require("http");

exports.handler = async (event, context) => {
  const req = event.Records[0].cf.request;
  const res = event.Records[0].cf.response;
  const headers = res.headers;

  if (res.status === "404" && req.uri.startsWith("/web/")) {
    const index_uri = req.uri.split("/", 3).join("/") + "/index.html"
    console.log("failed web req, should return index.html from", index_uri)
    const page = await fetchHttp(ORIGIN + index_uri)
    res.body = page
  }

  return res;
};

function fetchHttp(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let resp = ""
      res.on("data", (chunk) => { resp += chunk; });
      res.on("end", () => { resolve(resp); });
    }).on("error", (err) => {
      reject(err, null);
    });
  });
}
