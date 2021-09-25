"use strict";

const SESSION_COOKIE_NAME = "couchers-sesh"
const PREVIEW_DOMAIN = "preview.couchershq.org"
const PREVIEW_DOMAIN_SUFFIX = "." + PREVIEW_DOMAIN
const NEXT_DOMAIN = "next.couchershq.org"

const path = require("path");

exports.handler = (event, context, callback) => {
  const req = event.Records[0].cf.request;
  const req_host = req.headers.host[0].value
  const folder = resolvePath(req_host)
  const session_cookie = parseCookie(req.headers)
  const parsed_uri = path.parse(req.uri)

  if (folder === "/") {
    req.uri = "/preview.txt"
  } else if (session_cookie && folder.startsWith("/web/") && !parsed_uri.ext) {
    // on a query for the web app, if there's no file extension and the session cookie is set, return the react page so we don't get a flash from react snap
    req.uri = folder + "/200.html"
  } else {
    req.uri = folder + req.uri
  }

  callback(null, req);
};

function resolvePath(host) {
  // given a host like "abcd--efgh.preview-test.couchershq.org", we return a path "efgh/abcd"
  if (host == NEXT_DOMAIN) {
    return "/web/develop"
  } else if (host.endsWith(PREVIEW_DOMAIN_SUFFIX)) {
    const dynamic_bit = host.substring(0, host.length - PREVIEW_DOMAIN_SUFFIX.length);
    const [db1, db2] = dynamic_bit.split("--", 2);
    return "/" + db2 + "/" + db1
  } else {
    return "/"
  }
}

function parseCookie(headers) {
  if (headers.cookie) {
    const cookies = headers.cookie[0].value.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const [key, value] = cookies[i].split("=", 2)
      if (key == SESSION_COOKIE_NAME) {
        return value
      }
    }
  }
  return null
}
