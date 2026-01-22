"use client";

import { TrustPaymentForm } from "@/components/domain/trust/trust-payment-form";
import { loginForTest } from "@/app/actions/test-auth";
import { useState } from "react";

export default function TrustTestPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const result = await loginForTest();
    setIsLoggingIn(false);

    if (result.success && result.user) {
      setUserEmail(result.user.email || "Anonyme");
    } else {
      alert("Erreur login: " + result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 font-outfit">
            Test du Paiement "Confiance"
          </h1>
          <p className="mt-2 text-slate-500">
            Simulez un paiement mobile pour débloquer l'accès immédiat.
          </p>
        </div>

        {/* Login Simulation Button */}
        {!userEmail ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
            <p className="text-sm text-indigo-800 mb-3">
              Pour que la validation serveur fonctionne, il faut une session
              active.
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {isLoggingIn
                ? "Connexion en cours..."
                : "Simuler une Connexion (Test User)"}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center text-sm text-emerald-800">
            Connecté en tant que : <strong>{userEmail}</strong>
          </div>
        )}

        <TrustPaymentForm />

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Note Technique :</strong>
          <br />
          Si vous n'êtes pas connecté, l'action serveur échouera (vérifiez la
          console), mais l'UI devrait quand même passer en mode "Débloqué" grâce
          à l'Optimistic UI.
        </div>
      </div>
    </div>
  );
}
