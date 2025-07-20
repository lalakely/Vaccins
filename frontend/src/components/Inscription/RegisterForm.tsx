"use client";

import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaKey, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AlertCircle } from "lucide-react";
import { FaUserTie } from 'react-icons/fa';
import { buildApiUrl } from "../../config/api";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
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

function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        accountType: 'user',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordValid, setPasswordValid] = useState({
        length: true,
        uppercase: true,
        number: true,
        match: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === "password" || name === "confirmPassword") {
            const password = name === "password" ? value : formData.password;
            const confirmPassword = name === "confirmPassword" ? value : formData.confirmPassword;
            setPasswordValid({
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                number: /\d/.test(password),
                match: password === confirmPassword && password.length > 0
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const { length, uppercase, number, match } = passwordValid;
        if (!length || !uppercase || !number || !match) {
            setError("Le mot de passe doit avoir au moins 8 caractères, une majuscule, un chiffre, et correspondre à la confirmation.");
            return;
        }

        try {
            setLoading(true);
            const apiUrl = buildApiUrl('api/users/register');
            console.log('URL d\'inscription utilisée:', apiUrl);
            console.log('Données envoyées:', {
                username: formData.username,
                email: formData.email,
                accountType: formData.accountType,
                password: '***' // Masqué pour la sécurité
            });
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    accountType: formData.accountType,
                    password: formData.password
                })
            });
            
            console.log('Statut de la réponse:', response.status);
            console.log('Headers de la réponse:', Object.fromEntries(response.headers.entries()));
            
            let data;
            try {
                data = await response.json();
                console.log('Données de la réponse:', data);
            } catch (jsonError) {
                console.error('Erreur lors du parsing JSON:', jsonError);
                const textResponse = await response.text();
                console.log('Réponse texte brute:', textResponse);
                throw new Error(`Erreur de parsing JSON: ${jsonError.message}. Réponse brute: ${textResponse}`);
            }

            if (response.ok) {
                setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                setFormData({
                    username: '',
                    email: '',
                    accountType: 'user',
                    password: '',
                    confirmPassword: ''
                });
            } else {
                setError(data.message || 'Une erreur est survenue lors de l’inscription.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            setError('Impossible de soumettre les données. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field: string) => {
        if (field === "password") setShowPassword(!showPassword);
        if (field === "confirmPassword") setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center ">
            <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div >
                    <CardHeader className="rounded-t-xl">
                        <CardTitle className="text-2xl font-bold text-gray-800 text-center flex items-center justify-center gap-2">
                            Inscription
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6 p-6">
                        {message && (
                            <Alert className="bg-green-50 border-green-200 text-green-700">
                                <AlertTitle>Succès</AlertTitle>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}
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
                                    className="pl-10 h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400 hover:border-gray-500 rounded-full"
                                    placeholder="Entrez votre nom d'utilisateur"
                                    required
                                />
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                                    <FaUser />
                                </span>
                            </div>
                        </div>

                        {/* Champ Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FaEnvelope className="text-gray-500" /> Email
                            </Label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10 h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400 hover:border-gray-500 rounded-full"
                                    placeholder="Entrez votre email"
                                    required
                                />
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                                    <FaEnvelope />
                                </span>
                            </div>
                        </div>

                        {/* Champ Type de compte */}
                        <div className="space-y-2">
                            <Label htmlFor="accountType" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FaUserTie className="text-gray-500" /> Type de compte
                            </Label>
                            <select
                                id="accountType"
                                name="accountType"
                                value={formData.accountType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-400 hover:border-gray-500 rounded-lg shadow-sm"
                            >
                                <option value="user">Utilisateur</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Champ Mot de passe */}
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
                                    className={`pl-10 pr-10 h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400 hover:border-gray-500 rounded-full ${!passwordValid.length || !passwordValid.uppercase || !passwordValid.number ? 'border-red-500' : ''}`}
                                    placeholder="Entrez votre mot de passe"
                                    required
                                />
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                                    <FaKey />
                                </span>
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("password")}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {formData.password && (
                                <ul className="text-xs text-gray-600 mt-1">
                                    <li className={passwordValid.length ? 'text-green-600' : 'text-red-600'}>
                                        Au moins 8 caractères : {passwordValid.length ? '✓' : '✗'}
                                    </li>
                                    <li className={passwordValid.uppercase ? 'text-green-600' : 'text-red-600'}>
                                        Une majuscule : {passwordValid.uppercase ? '✓' : '✗'}
                                    </li>
                                    <li className={passwordValid.number ? 'text-green-600' : 'text-red-600'}>
                                        Un chiffre : {passwordValid.number ? '✓' : '✗'}
                                    </li>
                                </ul>
                            )}
                        </div>

                        {/* Champ Confirmer le mot de passe */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FaKey className="text-gray-500" /> Confirmer le mot de passe
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`pl-10 pr-10 h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400 hover:border-gray-500 rounded-full ${!passwordValid.match && formData.confirmPassword ? 'border-red-500' : ''}`}
                                    placeholder="Confirmez votre mot de passe"
                                    required
                                />
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                                    <FaKey />
                                </span>
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("confirmPassword")}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {!passwordValid.match && formData.confirmPassword && (
                                <p className="text-red-600 text-xs">Les mots de passe ne correspondent pas.</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 p-6 rounded-b-xl">
                        <Button 
                            type="submit" 
                            className="w-full h-12 bg-gray-700 text-white hover:bg-gray-800 transition-colors rounded-full flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? 'Chargement...' : 'Inscription'}
                            <FaArrowRight />
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            Vous avez déjà un compte ?{" "}
                            <Link to="/" className="text-gray-800 hover:text-gray-900 underline transition-colors">
                                Se connecter
                            </Link>
                        </p>
                    </CardFooter>
                </div>
            </form>
        </div>
    );
}

export default RegisterForm;