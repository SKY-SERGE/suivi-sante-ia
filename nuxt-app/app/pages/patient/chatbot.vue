<template>
  <div class="container mx-auto p-6 max-w-6xl">
    <!-- En-tête de la page -->
    <div class="mb-6">
      <div class="flex items-center space-x-3 mb-2">
        <div
          class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
        >
          <Icon name="lucide:bot" class="w-5 h-5 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Assistant Santé IA</h1>
      </div>
      <p class="text-gray-600">
        Obtenez des informations générales sur la santé et le bien-être. Notre
        assistant virtuel peut répondre à vos questions de base sur la santé.
      </p>
    </div>

    <!-- Interface du chatbot -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Chatbot principal -->
      <div class="lg:col-span-3 space-y-6">
        <Card>
          <CardContent class="p-0">
            <HealthChatbot />
          </CardContent>
        </Card>

        <!-- Avertissement important -->
        <Card class="mb-6 border-amber-200 bg-amber-50">
          <CardContent class="p-4">
            <div class="flex items-start space-x-3">
              <Icon
                name="lucide:alert-triangle"
                class="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0"
              />
              <div>
                <h3 class="font-semibold text-amber-900 mb-1">
                  Avertissement médical important
                </h3>
                <div class="text-sm text-amber-800 space-y-1">
                  <p>
                    • Ce chatbot fournit uniquement des informations générales
                    sur la santé
                  </p>
                  <p>
                    • Il ne peut pas diagnostiquer, prescrire ou remplacer un
                    avis médical professionnel
                  </p>
                  <p>
                    • En cas d'urgence médicale, contactez immédiatement le 15
                    (SAMU) ou rendez-vous aux urgences
                  </p>
                  <p>
                    • Pour tout problème de santé, consultez votre médecin
                    traitant ou un professionnel qualifié
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Panneau latéral d'aide -->
      <div class="lg:col-span-1 space-y-4">
        <!-- Informations utiles -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Icon name="lucide:info" class="w-5 h-5" />
              <span>Informations utiles</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="text-sm">
              <h4 class="font-medium text-gray-900 mb-1">
                Ce que je peux faire :
              </h4>
              <ul class="text-gray-600 space-y-1 text-xs">
                <li>• Informations sur la prévention</li>
                <li>• Conseils de bien-être général</li>
                <li>• Explications médicales de base</li>
                <li>• Rappels sur l'hygiène de vie</li>
              </ul>
            </div>

            <div class="text-sm">
              <h4 class="font-medium text-gray-900 mb-1">
                Ce que je ne peux pas faire :
              </h4>
              <ul class="text-gray-600 space-y-1 text-xs">
                <li>• Diagnostiquer des maladies</li>
                <li>• Prescrire des médicaments</li>
                <li>• Interpréter des analyses</li>
                <li>• Remplacer votre médecin</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <!-- Contacts d'urgence -->
        <Card class="border-red-200">
          <CardHeader>
            <CardTitle class="flex items-center space-x-2 text-red-700">
              <Icon name="lucide:phone" class="w-5 h-5" />
              <span>Urgences</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="text-sm">
              <div class="font-medium text-red-900">
                En cas d'urgence vitale :
              </div>
              <div class="text-red-700 font-mono text-lg">15 - SAMU</div>
              <div class="text-red-700 font-mono text-lg">
                112 - Urgences EU
              </div>
            </div>

            <div class="text-sm pt-2 border-t border-red-200">
              <div class="font-medium text-red-900">Autres contacts :</div>
              <div class="text-red-700 text-xs space-y-1">
                <div>18 - Pompiers</div>
                <div>17 - Police/Gendarmerie</div>
                <div>3114 - Numéro national de prévention du suicide</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Conseils d'utilisation -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Icon name="lucide:lightbulb" class="w-5 h-5" />
              <span>Conseils d'usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-sm text-gray-600 space-y-2">
              <p>• Posez des questions claires et précises</p>
              <p>• Utilisez des mots simples</p>
              <p>• N'hésitez pas à reformuler si besoin</p>
              <p>
                • Consultez toujours un professionnel pour un avis personnalisé
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Liens vers d'autres fonctionnalités -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Icon name="lucide:navigation" class="w-5 h-5" />
              <span>Autres outils</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <NuxtLink
              to="/patient/dashboard"
              class="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Icon name="lucide:activity" class="w-4 h-4" />
              <span>Tableau de bord santé</span>
            </NuxtLink>

            <NuxtLink
              to="/patient/health-data"
              class="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Icon name="lucide:clipboard-list" class="w-4 h-4" />
              <span>Saisie de données</span>
            </NuxtLink>

            <NuxtLink
              to="/patient/meals"
              class="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Icon name="lucide:utensils" class="w-4 h-4" />
              <span>Analyse des repas</span>
            </NuxtLink>

            <NuxtLink
              to="/patient/messages"
              class="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Icon name="lucide:mail" class="w-4 h-4" />
              <span>Messages sécurisés</span>
            </NuxtLink>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Métadonnées de la page
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
  title: "Assistant Santé IA",
});

// SEO
useSeoMeta({
  title: "Assistant Santé IA - Suivi Santé",
  description:
    "Chatbot intelligent pour obtenir des informations générales sur la santé et le bien-être. Posez vos questions à notre assistant virtuel.",
});
</script>
