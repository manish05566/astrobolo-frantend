// utils/chatGuard.js
const PENDING_KEY = "pending_astrologer_requests";
const ONGOING_KEY = "ongoing_chat";

const safeParse = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || fallback); }
  catch { return JSON.parse(fallback); }
};

export const getPending = () => safeParse(PENDING_KEY, "[]");
export const setPending = (arr) => localStorage.setItem(PENDING_KEY, JSON.stringify(arr));

export const markPending = (id) => {
  const a = getPending();
  if (!a.includes(id)) { a.push(id); setPending(a); }
};

export const unmarkPending = (id) => {
  setPending(getPending().filter(x => x !== id));
};

export const isBusyWith = (id) => {
  if (getPending().includes(id)) return true;
  const oc = safeParse(ONGOING_KEY, "null");
  return oc?.astrologer?.id === id;
};
