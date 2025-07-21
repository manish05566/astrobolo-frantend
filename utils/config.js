const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const api_url = base_url ;
export const endpoints = {
  folk_api_url: api_url + "folks",
  category_api_url: api_url + "config/homepageChatiesCollection",
  seo: api_url + "seo",
  base_url: api_url,
  folk_chat_api_url: api_url + "QnA",
  faq_chat_api_url: api_url + "faq",
  instagram: api_url + "instagram",
};
