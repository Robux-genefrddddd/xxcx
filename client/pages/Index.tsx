import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Animated gradient sphere background */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400 via-blue-300 to-orange-200 rounded-full blur-3xl opacity-30 animate-pulse -mr-48"></div>
      <div
        className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-t from-cyan-400 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-white">
            Studio
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white/80 hover:text-white transition">
              Features
            </a>
            <a href="#" className="text-white/80 hover:text-white transition">
              Pricing
            </a>
            <Link
              to="/dashboard"
              className="text-white/80 hover:text-white transition"
            >
              Docs
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-white/80 hover:text-white font-medium transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-cyan-400 text-blue-900 px-6 py-2 rounded-lg hover:bg-cyan-300 font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-blue-900/95 backdrop-blur p-6 space-y-4">
            <a
              href="#"
              className="block text-white/80 hover:text-white transition"
            >
              Features
            </a>
            <a
              href="#"
              className="block text-white/80 hover:text-white transition"
            >
              Pricing
            </a>
            <Link
              to="/dashboard"
              className="block text-white/80 hover:text-white transition"
            >
              Docs
            </Link>
            <div className="pt-4 space-y-3 border-t border-white/20">
              <Link
                to="/login"
                className="block text-white/80 hover:text-white font-medium transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block bg-cyan-400 text-blue-900 px-6 py-2 rounded-lg hover:bg-cyan-300 font-medium transition text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl w-full">
          {/* Left side - Card */}
          <div className="relative z-10">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl max-w-md mx-auto lg:mx-0">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-gray-900">Studio</span>
              </div>

              {/* Welcome text */}
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
              <p className="text-gray-600 mb-8 text-sm">
                Build amazing things effortlessly
              </p>

              {/* User avatar */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  👤
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4 mb-8">
                <div>
                  <input
                    type="text"
                    placeholder="USERNAME"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="PASSWORD"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              {/* Login button */}
              <Link
                to="/dashboard"
                className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2 mb-6 group"
              >
                LOGIN
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>

              {/* Footer links */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <Link to="/register" className="hover:text-gray-700">
                  Sign up
                </Link>
                <a href="#" className="hover:text-gray-700">
                  Forgot password?
                </a>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-8 pt-8 border-t border-gray-100">
                <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right side - Welcome text and gradient */}
          <div className="relative z-10 text-center lg:text-left">
            {/* Large gradient sphere effect */}
            <div className="relative h-96 flex items-center justify-center mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-300 to-orange-200 rounded-full blur-2xl opacity-50"></div>
              <div className="relative text-white">
                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                  Welcome.
                </h1>
              </div>
            </div>

            <p className="text-white/80 text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
              A modern platform designed to help teams collaborate, create, and
              ship faster. Intuitive, powerful, and built for everyone.
            </p>

            <div className="mt-8">
              <Link
                to="/register"
                className="inline-block bg-cyan-400 text-blue-900 px-8 py-3 rounded-lg hover:bg-cyan-300 font-bold transition"
              >
                Start Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - Features */}
      <div className="relative z-10 px-6 py-20 bg-gradient-to-t from-blue-900/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything you need
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Lightning Fast",
                description:
                  "Experience blazing-fast performance with our optimized infrastructure.",
              },
              {
                title: "Secure & Reliable",
                description:
                  "Enterprise-grade security to keep your data safe and protected.",
              },
              {
                title: "Intuitive Design",
                description:
                  "Beautiful, user-friendly interface that everyone loves to use.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition"
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-white/60 text-sm">
          <p>&copy; 2024 Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
