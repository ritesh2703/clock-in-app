import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { FcGoogle } from "react-icons/fc";
import Logo from "../img/logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!password.match(passwordRegex)) {
      setErrorMessage("Password must be at least 8 characters, include a number and a special symbol.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      
      const user = {
        displayName: username,
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL || "",
      };
      localStorage.setItem("user", JSON.stringify(user));
      
      navigate("/dashboard");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Email is already in use. Try logging in.");
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (window.innerWidth < 768) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const user = {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL || "",
        };
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google Login Failed:", error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row w-3/4 max-w-4xl">
        <div className="hidden md:flex md:w-1/2 relative">
          <img src={Logo} alt="Register" className="w-full h-full object-cover" />
      
        </div>

        <div className="w-full md:w-1/2 p-6">
          <h2 className="text-center text-2xl font-semibold mb-4">Register</h2>
          {errorMessage && <p className="text-red-500 text-center mb-3">{errorMessage}</p>}

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block font-medium">Username</label>
              <input type="text" className="w-full p-2 border rounded" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            
            <div className="mb-4">
              <label className="block font-medium">Email address</label>
              <input type="email" className="w-full p-2 border rounded" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            
            <div className="mb-4">
              <label className="block font-medium">Password</label>
              <input type="password" className="w-full p-2 border rounded" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            
            <div className="mb-4">
              <label className="block font-medium">Confirm Password</label>
              <input type="password" className="w-full p-2 border rounded" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Register</button>
          </form>
          
          <div className="text-center mt-3">
            <p>Already have an account? <a href="/login" className="text-blue-500">Login</a></p>
          </div>

          <div className="text-center mt-4">
            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center border p-2 rounded hover:bg-gray-200">
              <FcGoogle size={20} className="mr-2" /> Sign Up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;