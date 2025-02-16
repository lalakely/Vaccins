import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { FaUser, FaKey, FaArrowRight } from "react-icons/fa"
import { AlertCircle } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

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
            console.log("🟢 Token reçu :", data.token); // Log pour voir le token reçu

            localStorage.setItem("token", data.token); // Stocker le token
            localStorage.setItem("user", JSON.stringify(data.user)); // Stocker l'utilisateur

            login(data.token, data.user); // Met à jour le contexte Auth
            navigate("/Vaccins");
        } else {
            setError(data.message || "Une erreur est survenue.");
        }
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        setError("Impossible de se connecter. Veuillez réessayer.");
    }
};



  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Connexion</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Champ Username */}
          <div className="space-y-1">
            <Label htmlFor="username">Username :</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <FaUser />
              </span>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="pl-9"
                required
              />
            </div>
          </div>

          {/* Champ Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password :</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <FaKey />
              </span>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="pl-9"
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full">
            Connexion
            <FaArrowRight className="ml-2" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Tu n'as pas de compte ?{" "}
            <Link to="/Inscription" className="underline">
              S'inscrire
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  )
}

export default LoginForm
