export const isTokenExpired = (token, bufferSeconds = 0) => {
  if (!token) {
    console.log("Token is null or undefined");
    return true;
  }

  try {
    console.log("Token is", token);
    const payloadBase64 = token.split(".")[1]; // get the payload part
    const payload = JSON.parse(atob(payloadBase64)); // decode base64

    const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
    const exp = payload.exp;

    if (!exp) {
      console.warn("Missing 'exp' in token payload");
      return true;
    }

    const isExpired = exp < currentTime + bufferSeconds;
   
    return isExpired;
  } catch (error) {
    console.error("Failed to parse token", error);
    return true;
  }
};
