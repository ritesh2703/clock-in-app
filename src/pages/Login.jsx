import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithRedirect, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider } from "../firebase/firebase";
import Logo from "../img/logo.png"; // Ensure correct import

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("user", JSON.stringify({ email }));
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid Email or Password");
    }
  };

  const handleSocialLogin = async () => {
    try {
      if (window.innerWidth < 768) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        localStorage.setItem("user", JSON.stringify(result.user));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login Failed:", error.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetMessage("Please enter a valid email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      setResetMessage("Error: " + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex shadow-lg rounded-lg overflow-hidden w-full max-w-4xl">
        {/* Left Side - Image */}
        <div className="hidden md:block w-1/2">
          <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 bg-white p-6">
          <h2 className="text-center text-2xl font-bold mb-4">{showResetForm ? "Reset Password" : "Login"}</h2>

          {showResetForm ? (
            <form onSubmit={handlePasswordReset}>
              <label className="block mb-2 text-sm font-medium">Email address</label>
              <input type="email" className="w-full px-3 py-2 border rounded-lg" placeholder="Enter email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Send Reset Link</button>
              <p className="text-center mt-3 text-sm cursor-pointer text-blue-500 hover:underline" onClick={() => setShowResetForm(false)}>Back to Login</p>
              {resetMessage && <p className="text-center text-green-500 mt-2">{resetMessage}</p>}
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <label className="block mb-2 text-sm font-medium">Email address</label>
              <input type="email" className="w-full px-3 py-2 border rounded-lg" placeholder="Enter email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className="block mt-4 mb-2 text-sm font-medium">Password</label>
              <input type="password" className="w-full px-3 py-2 border rounded-lg" placeholder="Enter password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Login</button>
              <p className="text-center mt-3 text-sm cursor-pointer text-blue-500 hover:underline" onClick={() => setShowResetForm(true)}>Forgot Password?</p>
            </form>
          )}

          {!showResetForm && (
            <div className="mt-4 text-center">
              {/* Updated "Login with Google" Button UI */}
              <button
                className="w-full flex items-center justify-center bg-white border border-gray-300 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition"
                onClick={handleSocialLogin}
              >
                <FcGoogle className="mr-2 text-2xl" />
                <span className="text-gray-700 font-medium">Continue with Google</span>
              </button>

              <p className="mt-3 text-sm">
                Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
