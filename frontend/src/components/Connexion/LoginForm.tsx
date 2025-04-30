"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaUser, FaKey, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { AlertCircle } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe
  const [isPasswordValid, setIsPasswordValid] = useState(true); // État pour valider le mot de passe
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validation simple du mot de passe (au moins 6 caractères)
    if (name === "password") {
      setIsPasswordValid(value.length >= 6);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

 
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("🟢 Token reçu :", data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        login(data.token, data.user);
        navigate("/Dashboard");
      } else {
        setError(data.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setError("Impossible de se connecter. Veuillez réessayer.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="bg-white shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="bg-gray-50 rounded-t-xl border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-gray-800 text-center flex items-center justify-center gap-2">
              <FaUser className="text-gray-600" /> Connexion
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Champ Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaUser className="text-gray-500" /> Nom d'utilisateur
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400 hover:border-gray-500 rounded-lg shadow-sm"
                  placeholder="Entrez votre nom d'utilisateur"
                  required
                />
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                  <FaUser />
                </span>
              </div>
            </div>

            {/* Champ Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaKey className="text-gray-500" /> Mot de passe
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400 hover:border-gray-500 rounded-lg shadow-sm ${!isPasswordValid && formData.password ? 'border-red-500' : ''}`}
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                  <FaKey />
                </span>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 p-6 bg-gray-50 rounded-b-xl border-t border-gray-200">
            <Button 
              type="submit" 
              className="w-full bg-gray-700 text-white hover:bg-gray-800 transition-colors rounded-lg shadow-md flex items-center justify-center gap-2"
            >
              Connexion
              <FaArrowRight />
            </Button>

            <p className="text-center text-sm text-gray-600">
              Vous n'avez pas de compte ?{" "}
              <Link to="/Inscription" className="text-gray-800 hover:text-gray-900 underline transition-colors">
                S'inscrire
              </Link>
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default LoginForm;