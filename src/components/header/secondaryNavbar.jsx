import Link from "next/link";

const logo = "/images/logo.png";

const secondaryNavbar = () => {

 return (
<div className="container-fluid px-4 justify-content-between main-menu">
  <Link className="navbar-brand" href="/">
    <img
      src={logo}
      alt="Logo"
      className="img-fluid"
      style={{ height: "40px" }}
    />
  </Link>

  <ul className="nav">
    <li className="nav-item">
      <Link className="nav-link " href="/AstrologerChat">
        Chat With Astrologer
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link " href="/TalkAstrologer">
        Talk to Astrologer
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link " href="/Book-Pooja">
        Book a Pooja New
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link " href="/Astromall">
        Astromall
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link " href="/Astrotalk-Store">
        Astrotalk Store
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link " href="/Blog">
        Blog
      </Link>
    </li>
  </ul>
</div>
 );

};

export default secondaryNavbar;
