// hooks/useOrderSubmission.js
import { useState } from "react";

const nouveauJeton = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useOrderSubmission() {
  const [status, setStatus] = useState("form");
  const [jeton, setJeton] = useState(nouveauJeton);
  const [globalError, setGlobalError] = useState("");

  const submitOrder = async (form, cart) => {
    setStatus("processing");
    setGlobalError("");

    try {
      const res = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          clientToken: jeton,
          lignes: cart.map((i) => ({
            productId: i.product.id,
            size: i.size,
            qty: i.qty,
          })),
        }),
      });

      const brut = await res.text();
      const data = brut ? JSON.parse(brut) : {};

      if (!res.ok) {
        throw new Error(data.message || `Le serveur a répondu ${res.status}.`);
      }
      setJeton(nouveauJeton());
      return data;
    } catch (err) {
      console.error("Commande refusée :", err);
      setGlobalError(
        err.message ||
          "Connexion interrompue. Réessayez : votre commande ne sera pas créée en double.",
      );
      throw err; 
    } finally {
      setStatus("form");
    }
  };

  return { status, globalError, submitOrder };
}
