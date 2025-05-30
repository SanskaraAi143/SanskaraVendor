
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-wedneutral-50 border-t border-wedneutral-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-2xl font-serif font-bold text-wedrose-600">
                Wedding
              </span>
              <span className="text-2xl font-serif font-bold text-wedgold-600 ml-1">
                Wisdom
              </span>
            </div>
            <p className="text-wedneutral-600 text-sm max-w-xs">
              A comprehensive guide to wedding rituals, traditions, and planning
              services for your perfect day.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4 text-wedneutral-800">
              Navigation
            </h3>
            <ul className="space-y-2 text-wedneutral-600">
              <li>
                <Link
                  to="/"
                  className="hover:text-wedrose-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-wedrose-500 transition-colors"
                >
                  Traditions
                </Link>
              </li>
              <li>
                <Link
                  to="/vendors"
                  className="hover:text-wedrose-500 transition-colors"
                >
                  Vendors
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4 text-wedneutral-800">
              Resources
            </h3>
            <ul className="space-y-2 text-wedneutral-600">
              <li>
                <a
                  href="#"
                  className="hover:text-wedrose-500 transition-colors"
                >
                  Wedding Checklist
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-wedrose-500 transition-colors"
                >
                  Budget Planner
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-wedrose-500 transition-colors"
                >
                  Guest List Manager
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-wedrose-500 transition-colors"
                >
                  Wedding Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4 text-wedneutral-800">
              Contact
            </h3>
            <ul className="space-y-2 text-wedneutral-600">
              <li>support@weddingwisdom.com</li>
              <li>+1 (800) 123-4567</li>
              <li>123 Wedding Lane, Suite 101</li>
              <li>Ceremony City, WD 12345</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-wedneutral-200 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-wedneutral-500 text-sm">
            © {new Date().getFullYear()} Wedding Wisdom. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-wedneutral-500 hover:text-wedrose-500 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-wedneutral-500 hover:text-wedrose-500 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-wedneutral-500 hover:text-wedrose-500 transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
