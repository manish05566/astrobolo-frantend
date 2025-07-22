// utils/fetchClient.js
export async function fetchClient(url, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(opts.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined
  };
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) {
    // token is invalid or expired
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.replace("/");   // force hard redirect
    throw new Error("Unauthorized");
  }
  return res;
}
