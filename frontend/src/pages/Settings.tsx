import React, { useState, useEffect } from "react";
import { FaCog, FaUser, FaBell, FaShieldAlt, FaSave } from "react-icons/fa";
import NavBar from "../components/main/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  
  // États pour les différentes sections
  const [accountSettings, setAccountSettings] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Chargement des données utilisateur au montage du composant
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          
          // Initialiser les états avec les données utilisateur existantes
          setAccountSettings(prev => ({
            ...prev,
            username: parsedUser.username || "",
            email: parsedUser.email || ""
          }));
          
          // Récupérer les préférences de notification de l'utilisateur
          const response = await fetch(`http://localhost:3000/api/users/preferences`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setNotificationSettings({
              enableNotifications: data.enableNotifications || true,
              emailNotifications: data.emailNotifications || false,
              reminderNotifications: data.reminderNotifications || true,
              vaccineAlerts: data.vaccineAlerts || true
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données utilisateur.",
          variant: "destructive"
        });
      }
    };
    
    loadUserData();
  }, [toast]);
  
  const [notificationSettings, setNotificationSettings] = useState({
    enableNotifications: true,
    emailNotifications: false,
    reminderNotifications: true,
    vaccineAlerts: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Gestionnaires d'événements
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (name: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Non authentifié");
      }
      
      // Validation des mots de passe
      if (accountSettings.newPassword) {
        if (accountSettings.newPassword !== accountSettings.confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        
        if (accountSettings.newPassword.length < 6) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères");
        }
        
        if (!accountSettings.currentPassword) {
          throw new Error("Veuillez entrer votre mot de passe actuel");
        }
      }
      
      // Construire l'objet de données à envoyer
      const userData = {
        username: accountSettings.username,
        email: accountSettings.email
      };
      
      // Ajouter les mots de passe si présents
      if (accountSettings.newPassword && accountSettings.currentPassword) {
        Object.assign(userData, {
          currentPassword: accountSettings.currentPassword,
          newPassword: accountSettings.newPassword
        });
      }
      
      // Appel API pour mettre à jour les informations utilisateur
      const response = await fetch('http://localhost:3000/api/users/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour du profil");
      }
      
      const updatedUser = await response.json();
      
      // Mettre à jour les informations en localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const newUserData = {
          ...parsedUser,
          username: updatedUser.username || parsedUser.username,
          email: updatedUser.email || parsedUser.email
        };
        localStorage.setItem("user", JSON.stringify(newUserData));
      }
      
      toast({
        title: "Paramètres du compte mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
        variant: "default"
      });
      
      // Réinitialiser les mots de passe
      setAccountSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour des paramètres.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Non authentifié");
      }
      
      // Appel API pour mettre à jour les préférences de notification
      const response = await fetch('http://localhost:3000/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationSettings)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour des préférences");
      }
      
      toast({
        title: "Préférences de notification mises à jour",
        description: "Vos préférences de notification ont été enregistrées.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour des préférences.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-6xl mt-16">
      <div className="flex items-center gap-3 mb-6">
        <FaCog className="text-2xl text-primary" />
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>
      
      <Tabs defaultValue="account" className="w-full ">
        <TabsList className="flex gap-4 mb-8 p-1.5 tabs-list bg-white">
          <TabsTrigger value="account" className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full hover:shadow-xl transition-all duration-300 group data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <FaUser className="text-sm text-gray-500 group-data-[state=active]:text-gray-900" />
            <span className="text-sm text-gray-500 group-data-[state=active]:text-gray-900">Compte</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full hover:shadow-xl transition-all duration-300 group data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <FaBell className="text-sm text-gray-500 group-data-[state=active]:text-gray-900" />
            <span className="text-sm text-gray-500 group-data-[state=active]:text-gray-900">Notifications</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="content-left">
            <CardHeader className="pt-6 pb-5">
              <CardTitle className="flex items-end gap-2">
                <FaUser className="text-primary" /> 
                Paramètres du compte
              </CardTitle>
              <CardDescription className="text-left">
                Gérez les informations de votre compte et vos préférences de sécurité.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAccountSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-left">Nom d'utilisateur</Label>
                    <Input 
                      id="username" 
                      name="username"
                      value={accountSettings.username}
                      onChange={handleAccountChange}
                      placeholder="Votre nom d'utilisateur"
                      className="rounded-full py-5 px-6"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-left">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      value={accountSettings.email}
                      onChange={handleAccountChange}
                      placeholder="votre.email@exemple.com"
                      className="rounded-full py-5 px-6"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-4 flex items-end gap-2">
                    <FaShieldAlt className="text-primary" />
                    Changer de mot de passe
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="currentPassword" className="text-left">Mot de passe actuel</Label>
                      <Input 
                        id="currentPassword" 
                        name="currentPassword"
                        type="password"
                        value={accountSettings.currentPassword}
                        onChange={handleAccountChange}
                        placeholder="••••••••"
                        className="rounded-full py-5 px-6"
                      />
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <Label htmlFor="newPassword" className="text-left">Nouveau mot de passe</Label>
                      <Input 
                        id="newPassword" 
                        name="newPassword"
                        type="password"
                        value={accountSettings.newPassword}
                        onChange={handleAccountChange}
                        placeholder="••••••••"
                        className="rounded-full py-6 px-6"
                      />
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <Label htmlFor="confirmPassword" className="text-left">Confirmer le mot de passe</Label>
                      <Input 
                        id="confirmPassword" 
                        name="confirmPassword"
                        type="password"
                        value={accountSettings.confirmPassword}
                        onChange={handleAccountChange}
                        placeholder="••••••••"
                        className="rounded-full py-6 px-6"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Enregistrer les changements
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <div>
            <CardHeader className="pt-6 pb-5 text-left">
              <CardTitle className="flex items-center gap-2">
                <FaBell className="text-primary" />
                Paramètres de notification
              </CardTitle>
              <CardDescription>
                Configurez comment et quand vous souhaitez être notifié.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleNotificationSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Activer les notifications</h4>
                      <p className="text-sm text-gray-500">Activez ou désactivez toutes les notifications</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.enableNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("enableNotifications", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notifications par email</h4>
                      <p className="text-sm text-gray-500">Recevez des notifications par email</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                      disabled={!notificationSettings.enableNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Rappels de vaccins</h4>
                      <p className="text-sm text-gray-500">Recevez des rappels pour les vaccinations à venir</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.reminderNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("reminderNotifications", checked)}
                      disabled={!notificationSettings.enableNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertes de vaccins</h4>
                      <p className="text-sm text-gray-500">Recevez des alertes sur les nouveaux vaccins disponibles</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.vaccineAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("vaccineAlerts", checked)}
                      disabled={!notificationSettings.enableNotifications}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Enregistrer les préférences
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
