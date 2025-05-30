
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white bg-opacity-90 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-serif font-bold text-wedrose-600">
                Wedding
              </span>
              <span className="text-2xl font-serif font-bold text-wedgold-600 ml-1">
                Wisdom
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" active={location.pathname === "/"}>
              Home
            </NavLink>
            <NavLink to="/about" active={location.pathname === "/about"}>
              Traditions
            </NavLink>
            <NavLink to="/vendors" active={location.pathname === "/vendors"}>
              Vendors
            </NavLink>
            <Button className="ml-4 btn-primary">Get Started</Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-wedrose-600 hover:text-wedrose-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="flex flex-col space-y-3 pt-4 pb-6 px-2 animate-fade-in">
              <MobileNavLink
                to="/"
                active={location.pathname === "/"}
                onClick={toggleMenu}
              >
                Home
              </MobileNavLink>
              <MobileNavLink
                to="/about"
                active={location.pathname === "/about"}
                onClick={toggleMenu}
              >
                Traditions
              </MobileNavLink>
              <MobileNavLink
                to="/vendors"
                active={location.pathname === "/vendors"}
                onClick={toggleMenu}
              >
                Vendors
              </MobileNavLink>
              <Button className="w-full btn-primary mt-2" onClick={toggleMenu}>
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

type NavLinkProps = {
  to: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

const NavLink = ({ to, active, children }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
        active
          ? "text-wedrose-600 bg-wedrose-50"
          : "text-wedneutral-700 hover:text-wedrose-500 hover:bg-wedrose-50"
      }`}
    >
      {children}
    </Link>
  );
};

const MobileNavLink = ({ to, active, children, onClick }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-300 ${
        active
          ? "text-wedrose-600 bg-wedrose-50"
          : "text-wedneutral-700 hover:text-wedrose-500 hover:bg-wedrose-50"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Navbar;
