import { streamText, type CoreMessage } from "ai";
import { useAiSdk } from "~/composables/useAiSdk";

export default defineLazyEventHandler(async () => {
  const { googleAi } = useAiSdk();

  return defineEventHandler(async (event: any) => {
    const {
      message,
      conversationHistory,
    }: {
      message: string;
      conversationHistory: Array<{ role: string; content: string }>;
    } = await readBody(event);

    // Prompt système pour le chatbot de santé
    const systemPrompt = `Tu es un assistant de santé bienveillant et responsable. Tu dois :

RÈGLES STRICTES :
1. Ne jamais donner de diagnostic médical
2. Ne jamais prescrire de médicaments
3. Ne jamais remplacer un avis médical professionnel
4. Toujours encourager à consulter un professionnel en cas de doute
5. En cas d'urgence détectée, rediriger immédiatement vers les services d'urgence

URGENCES (répondre immédiatement avec le protocole d'urgence) :
- Douleur thoracique intense, difficulté respiratoire
- Perte de conscience, convulsions
- Hémorragie importante, trauma grave
- Signes d'AVC ou crise cardiaque
- Pensées suicidaires ou détresse extrême

RÉPONSES AUTORISÉES :
- Informations générales sur la santé et bien-être
- Conseils de prévention et hygiène de vie
- Explications sur les symptômes courants (sans diagnostic)
- Encourager les bonnes habitudes alimentaires et d'exercice
- Redirection vers les bonnes ressources médicales

STRUCTURE DE RÉPONSE :
- Réponse empathique et informative
- Toujours inclure un disclaimer médical approprié
- Suggérer la consultation d'un professionnel si nécessaire
- Rester dans le domaine informatif, jamais prescriptif

Réponds en français, avec bienveillance et responsabilité.`;

    // Construire les messages pour l'IA
    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(
        (msg): CoreMessage => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })
      ),
      { role: "user", content: message },
    ];

    try {
      const result = await streamText({
        model: googleAi("gemini-2.0-flash-exp"),
        messages,
        temperature: 0.3, // Réponses plus constantes pour la santé
        topP: 0.8,
      });

      // Analyser la réponse générée pour déterminer le type
      const fullText = await result.text;

      let responseType: "text" | "warning" | "emergency" = "text";
      let requiresDisclaimer = false;
      let suggestedActions: string[] = [];

      // Détecter les urgences dans la réponse
      const emergencyKeywords = [
        "urgence",
        "emergency",
        "appelez",
        "contactez immédiatement",
        "15",
        "112",
      ];
      const hasEmergencyKeywords = emergencyKeywords.some((keyword) =>
        fullText.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasEmergencyKeywords) {
        responseType = "emergency";
        requiresDisclaimer = true;
        suggestedActions = [
          "Appeler le 15 (SAMU)",
          "Appeler le 112",
          "Se rendre aux urgences",
        ];
      }

      // Détecter les avertissements
      const warningKeywords = [
        "consulter",
        "médecin",
        "professionnel",
        "avis médical",
      ];
      const hasWarningKeywords = warningKeywords.some((keyword) =>
        fullText.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasWarningKeywords && responseType !== "emergency") {
        responseType = "warning";
        requiresDisclaimer = true;
        suggestedActions = [
          "Consulter votre médecin",
          "Prendre rendez-vous",
          "Demander un avis professionnel",
        ];
      }

      return {
        success: true,
        message: fullText,
        type: responseType,
        requiresDisclaimer,
        suggestedActions:
          suggestedActions.length > 0 ? suggestedActions : undefined,
      };
    } catch (error) {
      console.error("Health chat error:", error);
      return {
        success: false,
        error: "Erreur lors de la génération de la réponse",
        message: "Je rencontre des difficultés techniques. Veuillez réessayer.",
        type: "warning",
        requiresDisclaimer: true,
      };
    }
  });
});
