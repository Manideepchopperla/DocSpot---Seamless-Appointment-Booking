import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, Stethoscope } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ---------- TOP BAR ---------- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-4 left-4 right-4 z-50 rounded-2xl px-4 py-2 shadow-lg transition ${
          scrolled
            ? "bg-white/60 backdrop-blur-md border border-gray-200"
            : "bg-white/30 backdrop-blur-sm border border-transparent"
        }`}
      >
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              DocSpot
            </span>
          </Link>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <button className="px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 transition">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* ---------- MOBILE DRAWER ---------- */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-lg z-50 flex flex-col rounded-l-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <span className="text-xl font-semibold">Menu</span>
              <button onClick={() => setOpen(false)}>
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <div className="flex flex-col gap-6 px-6 py-8">
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <button className="w-full px-4 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition">
                    Sign In
                  </button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <button className="w-full px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
