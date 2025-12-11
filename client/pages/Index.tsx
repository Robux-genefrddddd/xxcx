import { Link } from "react-router-dom";
import { ArrowRight, Mail, Lock, User } from "lucide-react";
import { useState } from "react";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 via-purple-500 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-tr from-cyan-500 via-blue-400 to-transparent rounded-full blur-3xl opacity-15 animate-pulse" style={{ animationDelay: "2s" }}></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F91e2732f1c03487e879c66ee97e72712%2Fee08390eccc04e8dbea3ce5415d97e92?format=webp&width=800"
              alt="PinPinCloud"
              className="w-8 h-8 object-contain group-hover:scale-110 transition"
            />
            <span className="text-lg font-semibold text-white">PinPinCloud</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white/60 hover:text-white transition text-sm">
              Fonctionnalités
            </a>
            <a href="#" className="text-white/60 hover:text-white transition text-sm">
              Tarification
            </a>
            <a href="#" className="text-white/60 hover:text-white transition text-sm">
              Documentation
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-white/60 hover:text-white font-medium transition text-sm">
              Aide
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="w-full max-w-md">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Bienvenue
            </h1>
            <p className="text-white/60 text-lg max-w-sm mx-auto">
              Accédez à votre espace personnel et gérez vos projets en temps réel
            </p>
          </div>

          {/* Login Card */}
          <div className="relative group mb-8">
            {/* Glow background */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

            {/* Card */}
            <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              {/* Logo */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F91e2732f1c03487e879c66ee97e72712%2Fee08390eccc04e8dbea3ce5415d97e92?format=webp&width=800"
                  alt="PinPinCloud"
                  className="w-8 h-8 object-contain"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-8 p-1 bg-slate-800/50 rounded-lg border border-white/10">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm ${
                    isLogin
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm ${
                    !isLogin
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Inscription
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4 mb-8">
                {!isLogin && (
                  <div className="relative group/input">
                    <input
                      type="text"
                      placeholder="Nom complet"
                      className="w-full px-4 py-3 pl-10 bg-slate-800/50 border border-white/10 group-hover/input:border-cyan-500/50 focus:border-cyan-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-colors text-sm"
                    />
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500 group-focus-within/input:text-cyan-400 transition" />
                  </div>
                )}

                <div className="relative group/input">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 pl-10 bg-slate-800/50 border border-white/10 group-hover/input:border-cyan-500/50 focus:border-cyan-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-colors text-sm"
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500 group-focus-within/input:text-cyan-400 transition" />
                </div>

                <div className="relative group/input">
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full px-4 py-3 pl-10 bg-slate-800/50 border border-white/10 group-hover/input:border-cyan-500/50 focus:border-cyan-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-colors text-sm"
                  />
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500 group-focus-within/input:text-cyan-400 transition" />
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between text-sm pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded bg-slate-800 border border-white/20 accent-cyan-500"
                      />
                      <span className="text-white/60 group-hover:text-white transition">
                        Se souvenir de moi
                      </span>
                    </label>
                    <a href="#" className="text-cyan-400 hover:text-cyan-300 transition font-medium">
                      Oublié?
                    </a>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-200 group flex items-center justify-center gap-2 mb-6 hover:scale-[1.02]">
                {isLogin ? "Se Connecter" : "Créer un Compte"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              {/* Footer */}
              <p className="text-center text-sm text-white/50">
                {isLogin ? "Pas encore inscrit?" : "Déjà inscrit?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition"
                >
                  {isLogin ? "S'inscrire" : "Se Connecter"}
                </button>
              </p>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <span className="text-white/40 text-xs">OU</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              {/* Social Login */}
              <button className="w-full py-2.5 px-4 border border-white/20 hover:border-white/40 bg-slate-800/30 hover:bg-slate-800/60 rounded-lg text-white text-sm font-medium transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92h8.85c.2 1.1.01 2.84-.88 4.3-.5 1.02-2.02 2.53-4.57 2.53-2.44 0-4.44-1.6-5.12-3.74H7.84c.48 2.45 2.25 4.97 5.23 4.97 2.5 0 4.9-.87 6.52-2.55 1.25-1.27 1.96-2.74 2.2-4.53h.05c.37-.05.74-.1 1.1-.1 1.1 0 1.82.35 2.02.97h3.26c-.5-1.6-2.15-3.83-4.1-4.39v-.05c-1.3-.4-2.64-.4-3.84-.05-1.2.35-2.4 1.05-3.2 2.05zm.05 3.5c.5 1.25 1.97 2.5 4 2.5 2.05 0 3.48-1.25 3.98-2.5H12.53z" />
                </svg>
                Continuer avec Google
              </button>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-center text-xs text-white/40">
            En continuant, vous acceptez nos{" "}
            <a href="#" className="hover:text-white/60 underline transition">
              conditions d'utilisation
            </a>
          </p>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 right-10 w-32 h-32 border border-cyan-500/20 rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-10 w-24 h-24 border border-purple-500/20 rounded-full mix-blend-screen pointer-events-none"></div>
    </div>
  );
}
