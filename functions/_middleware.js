addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  let path = url.pathname;

  // Normalize path
  if (path.endsWith("/")) path = path.slice(0, -1);

  // Supported folders
  const supportedLangs = ["/de", "/bg", "/en"];

  // If user is already on a supported path, just serve it
  if (supportedLangs.includes(path)) {
    return fetch(request);
  }

  // Detect Accept-Language
  const acceptLang = request.headers.get("Accept-Language") || "";
  const langHeader = acceptLang.toLowerCase();

  // Detect Country by Cloudflare
  const country = request.cf?.country || "";

  let redirectPath = "/"; // default English

  // German
  if (country === "DE" || langHeader.startsWith("de")) {
    redirectPath = "/de";
  }
  // Bulgarian
  else if (country === "BG" || langHeader.startsWith("bg")) {
    redirectPath = "/bg";
  }

  // Unknown folder like /fr → fallback to English
  if (path.startsWith("/")) {
    const firstSeg = "/" + path.split("/")[1];
    if (!supportedLangs.includes(firstSeg) && firstSeg !== "") {
      redirectPath = "/";
    }
  }

  return Response.redirect(`${url.origin}${redirectPath}/`, 302);
}
