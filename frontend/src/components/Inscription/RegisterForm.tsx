import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaKey, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        accountType: 'user',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false); // Indicateur de chargement
    const [message, setMessage] = useState(''); // Message de réponse

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérifiez que les mots de passe correspondent
        if (formData.password !== formData.confirmPassword) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }

        try {
            setLoading(true); // Active le chargement
            setMessage(''); // Réinitialise le message

            // Envoyer les données au backend
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    accountType: formData.accountType,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Inscription réussie !');
                setFormData({
                    username: '',
                    email: '',
                    accountType: 'user',
                    password: '',
                    confirmPassword: ''
                });
            } else {
                setMessage(data.message || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            setMessage('Impossible de soumettre les données. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false); // Désactive le chargement
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Inscription</h2>
            {message && <p className="text-center text-sm mb-4 text-red-500">{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2 text-left">Nom d'utilisateur:</label>
                    <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                        <FaUser className="text-gray-400 mx-2" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-2 py-2 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 text-left ">Email:</label>
                    <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                        <FaEnvelope className="text-gray-400 mx-2" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-2 py-2 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-2 text-left ">Type de compte :</label>
                    <select
                        id="accountType"
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 text-left ">Mot de passe:</label>
                    <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                        <FaKey className="text-gray-400 mx-2" />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-2 py-2 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 text-left ">Confirmer le mot de passe:</label>
                    <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                        <FaKey className="text-gray-400 mx-2" />
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-2 py-2 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                    disabled={loading}
                >
                    {loading ? 'Chargement...' : 'Inscription'} <FaArrowRight className="ml-2" />
                </button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Tu as déjà un compte ? 
                    <Link to="/" className="text-blue-500 hover:underline"> Se connecter</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterForm;
