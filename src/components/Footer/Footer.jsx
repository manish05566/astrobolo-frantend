import React from 'react';
import Link from "next/link";
//import './Footer.css';

function Footer() {
  const GoogleStor = "/images/gstor.png";
  const AppStor = "/images/aapstor.png";


  const handleVendorLoginClick = () => {
  window.dispatchEvent(new Event("openVendorLoginModal"));
};


  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row">

          {/* Logo and Description */}
          <div className="col-md-4">
            <h3 className="logo-text">AstroBolo</h3>
            <p>Consectetur adipiscing elit do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <h6 className='text-white mb-3'>Astrobolo Mobile Apps</h6>
            <div className='stor-mg'>
            
              <Link href="#"><img className='footer-img' src={GoogleStor} alt="Google Play Store" /></Link>
              <Link href="#"><img className='footer-img' src={AppStor} alt="Apple App Store" /></Link>
            </div>
            <h6 className='text-white mt-3'>Follow us on</h6>
            <div className="social-icons mt-3">
              <Link href="#"><i className="fab fa-facebook-f"></i></Link>
              <Link href="#"><i className="fab fa-twitter"></i></Link>
              <Link href="#"><i className="fab fa-google-plus-g"></i></Link>
              <Link href="#"><i className="fab fa-youtube"></i></Link>
            </div>
          </div>

          {/* Our Services */}
          <div className="col-md-2">
            <div className="hs_footer_help_wrapper">
              <h5>Our Services</h5>
              <ul>
                <li><Link href="#">Horoscopes</Link></li>
                <li><Link href="#">Gemstones</Link></li>
                <li><Link href="#">Numerology</Link></li>
                <li><Link href="#">Tarot Cards</Link></li>
                <li><Link href="#">Birth Journal</Link></li>
                <li> <button onClick={handleVendorLoginClick} className="btn btn-outline-light mt-3">
                  Vendor Login
                </button></li>

              </ul>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-md-2">
            <h5>Quick Links</h5>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/astrologers">Astrologers</Link></li>
              <li><Link href="/intriguing">Intriguing</Link></li>
              <li><Link href="/appointment">Appointment</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="col-md-4 contact-info">
            <h5>Contact Us</h5>
            <p><i className="fas fa-map-marker-alt"></i> Gotham Hall, 1356 Brodwy square, NY 10018, California, USA</p>
            <p><i className="fas fa-envelope"></i> <a href="mailto:astrobolo@example.com">astrobolo@example.com</a></p>
            <p><i className="fas fa-phone-alt"></i> <a href="tel:+911800124105">+91 1800-124-105</a></p>
            <p><i className="fas fa-phone-alt"></i> <a href="tel:+911800326324">+91 1800-326-324</a></p>
          </div>

        </div>
      </div>
      <div className="copyright">
        <p>Copyright © 2025 AstroBolo. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
