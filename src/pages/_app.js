import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Navbar from "../components/header/Navbar";
import Footer from "../components/Footer/Footer";
import "../components/common.css"; // if you want global common css
import "../components/header/navbar.css";
import "../styles/globals.css"; // next.js default global css
import useAuthGuard from "../hooks/useAuthGuard";
//import useGlobalChat from "../../utils/useGlobalChat";

function MyApp({ Component, pageProps }) {
   //useAuthGuard();
   //useGlobalChat();
  useEffect(() => {
    // Dynamically import Bootstrap JS on the client side (after the component mounts)
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.bundle.min.js")
        .then(() => {
          // You can perform any additional initialization here if needed
        })
        .catch((err) => {
          console.error("Error loading Bootstrap JS:", err);
        });
    }
  }, []); // Empty dependency array means this runs only once after the component mounts

  return (
    <>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
