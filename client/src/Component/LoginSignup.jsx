import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function AuthContainer() {
  const navigate = useNavigate();

  const [isLoginView, setIsLoginView] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLoginView) {
      if (formData.password !== formData.confirmPassword) {
        return setError("Passwords do not match");
      }

      try {
        const response = await fetch(
          "https://crypto-mern-q442.onrender.com/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return setError(data.message || "Registration failed");
        }

        localStorage.setItem("token", data.token);
        alert("Account created successfully!");
        navigate("/dashboard/overview");
      } catch (err) {
        setError("Error connecting to server. Please try again later.");
      }
    } else {
      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return setError(data.message || "Invalid email or password");
        }

        localStorage.setItem("token", data.token);
        alert("Login successful!");
        navigate("/dashboard/overview");
      } catch (err) {
        setError("Error connecting to server. Please try again later.");
      }
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0a1f2c] to-[#0e2a3a] p-4">
      <div className="flex w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl">
        {/* LEFT SIDE (Illustration Area) */}
        <div className="hidden lg:flex w-1/2 bg-[#0f2a3a] items-center justify-center relative">
          <div className="text-blue-300 text-center px-10">
            <h1 className="text-3xl font-bold mb-4">Welcome Back</h1>
            <p className="text-sm opacity-70">
              Manage your dashboard securely and efficiently.
            </p>

            {/* Placeholder illustration */}
            <div className="mt-10 w-40 h-40 mx-auto bg-blue-500/20 rounded-xl flex items-center justify-center">
              💻
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="w-full lg:w-1/2 bg-[#0d2433] text-white p-10">
          <h2 className="text-3xl font-semibold mb-2">
            {isLoginView ? "Login" : "Create Account"}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {isLoginView
              ? "Sign in to continue using dashboard"
              : "Register to start using dashboard"}
          </p>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 rounded bg-[#123447] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email or username"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded bg-[#123447] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded bg-[#123447] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {!isLoginView && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 rounded bg-[#123447] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 transition py-3 rounded font-semibold cursor-pointer"
            >
              {isLoginView ? "LOGIN" : "REGISTER"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="px-3 text-sm text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Social buttons */}
          <div className="flex gap-4">
            <button className="flex-1 border border-gray-500 py-2 rounded hover:bg-gray-700">
              Google
            </button>
            <button className="flex-1 border border-gray-500 py-2 rounded hover:bg-gray-700">
              Facebook
            </button>
          </div>

          {/* Toggle */}
          <p className="text-center mt-6 text-sm text-gray-400">
            {isLoginView
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError("");
              }}
              className="ml-2 text-blue-400 hover:underline"
            >
              {isLoginView ? "Register here" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
