// Test basique de l'API health-chat pour valider l'intégration
// Ce fichier peut être supprimé après validation

async function testHealthChatAPI() {
  try {
    console.log("🧪 Test de l'API health-chat...");

    // Test 1: Message normal
    const normalTest = await fetch("/api/ai/health-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Comment maintenir une bonne hygiène de vie ?",
        conversationHistory: [],
      }),
    });

    const normalResponse = await normalTest.json();
    console.log("✅ Réponse normale:", normalResponse);

    // Test 2: Détection d'urgence
    const emergencyTest = await fetch("/api/ai/health-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message:
          "J'ai une douleur intense dans la poitrine et je ne peux plus respirer",
        conversationHistory: [],
      }),
    });

    const emergencyResponse = await emergencyTest.json();
    console.log("🚨 Réponse urgence:", emergencyResponse);

    // Test 3: Message invalide
    const invalidTest = await fetch("/api/ai/health-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "",
        conversationHistory: [],
      }),
    });

    const invalidResponse = await invalidTest.json();
    console.log("❌ Réponse invalide:", invalidResponse);
  } catch (error) {
    console.error("Erreur lors du test:", error);
  }
}

// Exporter la fonction pour utilisation dans la console du navigateur
if (typeof window !== "undefined") {
  (window as any).testHealthChatAPI = testHealthChatAPI;
}

export { testHealthChatAPI };
