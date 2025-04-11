import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { supabase } from "../../lib/supabase";

export const FinalLogin = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error checking user:", err);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError(null);

    // Validate email
    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (isSignUp && !validatePassword(password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }
    
    setLoading(true);

    try {
      if (isSignUp) {
        // Try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            setError("An account with this email already exists. Please sign in instead.");
            setIsSignUp(false);
          } else {
            throw signUpError;
          }
          return;
        }

        if (signUpData.user) {
          setError("Account created successfully! Please check your email to verify your account.");
          setIsSignUp(false);
        }
      } else {
        // Try to sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message === "Invalid login credentials") {
            setError("Invalid email or password. Please try again.");
          } else {
            throw signInError;
          }
          return;
        }

        if (data.user) {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address to reset your password");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (resetError) throw resetError;

      setError("Password reset instructions have been sent to your email");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col items-center min-h-screen">
      <header className="w-full h-20 bg-[#1900ff] flex items-center justify-center">
        <h1 className="font-bold text-white text-xl tracking-[-0.23px] leading-5 [font-family:'Helvetica_Rounded-Bold',Helvetica]">
          TIME MANAGEMENT
        </h1>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 w-full px-4">
        <img
          className="w-[394px] h-[97px] object-cover mb-12"
          alt="UBC BIM Services Logo"
          src="/image-1.png"
        />

        <div className="text-2xl text-black [font-family:'Inter',Helvetica] mb-8 text-center">
          <p>Welcome to Resource Management System</p>
          <br />
          <p>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSignIn} className="w-full max-w-[564px]">
          <Card className="rounded-[20px] shadow-[0px_11px_27.5px_-2px_#00000040]">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block [font-family:'Inter',Helvetica] text-[17px]"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-2 text-[17px] [font-family:'Inter',Helvetica] border-[#5c5c5c] text-[#999999f7]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="[font-family:'Inter',Helvetica] text-[17px]"
                    >
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="[font-family:'Inter',Helvetica] text-[17px] text-black hover:text-gray-600"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full p-2 text-[17px] [font-family:'Inter',Helvetica] border-[#383838] text-[#999999f7]"
                    required
                    minLength={8}
                  />
                  {isSignUp && (
                    <p className="text-sm text-gray-500 mt-1">
                      Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number
                    </p>
                  )}
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#c1c1c1] hover:bg-black hover:text-white text-black rounded-[5px] p-2 h-auto [font-family:'Inter',Helvetica] text-[17px] font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setEmail("");
                    setPassword("");
                  }}
                  variant="secondary"
                  className="w-full bg-[#b3b3b3d1] hover:bg-black hover:text-white text-black rounded-[5px] p-2 h-auto [font-family:'Inter',Helvetica] text-[17px] font-normal"
                >
                  {isSignUp ? 'Back to Sign In' : 'Create New Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>

      <footer className="w-full py-6 flex flex-col items-center">
        <div className="flex gap-8 mb-2">
          <a
            href="#"
            className="[font-family:'Inter',Helvetica] font-light text-[#5c5c5c] text-xs hover:text-black"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="[font-family:'Inter',Helvetica] font-light text-[#5c5c5c] text-xs hover:text-black"
          >
            Terms of Service
          </a>
        </div>
        <p className="[font-family:'Inter',Helvetica] font-light text-[#5c5c5c] text-xs">
          2025 Time Management. All rights reserved @ubc bim.
        </p>
      </footer>
    </div>
  );
};