<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <section
      class="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20"
    >
      <Container>
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
            Votre santé, <br />
            <span class="text-blue-600">intelligemment suivie</span>
          </h1>
          <p class="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Une plateforme complète et personnalisée qui utilise l'intelligence
            artificielle pour vous aider à surveiller votre santé, faciliter la
            communication avec vos médecins et optimiser votre bien-être.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/auth/register">
              <Button size="lg" class="bg-blue-600 hover:bg-blue-700 px-8 py-4">
                <Icon name="lucide:rocket" class="h-5 w-5 mr-2" />
                Commencer gratuitement
              </Button>
            </NuxtLink>
            <Button
              size="lg"
              variant="outline"
              @click="scrollToFeatures"
              class="px-8 py-4"
            >
              <Icon name="lucide:play-circle" class="h-5 w-5 mr-2" />
              Découvrir les fonctionnalités
            </Button>
          </div>
        </div>
      </Container>
    </section>
    <!-- Fonctionnalités principales -->
    <section id="features" class="py-20 bg-white">
      <Container>
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fonctionnalités innovantes
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez comment l'IA révolutionne le suivi de votre santé avec des
            outils intelligents et personnalisés.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Analyse IA des repas -->
          <Card variant="interactive" class="text-center">
            <CardContent>
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4"
              >
                <Icon name="lucide:camera" class="h-8 w-8 text-blue-600" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Analyse IA des repas
              </h3>
              <p class="text-gray-600">
                Prenez une photo de votre repas et obtenez une analyse
                intelligente de vos habitudes alimentaires avec des
                recommandations personnalisées.
              </p>
            </CardContent>
          </Card>
          <!-- Chatbot santé -->
          <Card variant="interactive" class="text-center">
            <CardContent>
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
              >
                <Icon
                  name="lucide:message-circle"
                  class="h-8 w-8 text-green-600"
                />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Chatbot santé IA
              </h3>
              <p class="text-gray-600">
                Posez vos questions de santé à notre assistant IA disponible
                24h/24 pour des informations fiables et des conseils de base.
              </p>
            </CardContent>
          </Card>

          <!-- Suivi personnalisé -->
          <Card class="p-6 hover:shadow-lg transition-shadow">
            <div class="text-center">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4"
              >
                <Icon name="lucide:target" class="h-8 w-8 text-purple-600" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Objectifs personnalisés
              </h3>
              <p class="text-gray-600">
                Définissez et suivez vos objectifs de santé avec des
                visualisations claires et un suivi de progrès intelligent.
              </p>
            </div>
          </Card>

          <!-- Communication sécurisée -->
          <Card class="p-6 hover:shadow-lg transition-shadow">
            <div class="text-center">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
              >
                <Icon name="lucide:shield-check" class="h-8 w-8 text-red-600" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Communication sécurisée
              </h3>
              <p class="text-gray-600">
                Échangez en toute sécurité avec vos médecins grâce à un système
                de messagerie chiffrée et de gestion des consentements.
              </p>
            </div>
          </Card>

          <!-- Suivi en temps réel -->
          <Card class="p-6 hover:shadow-lg transition-shadow">
            <div class="text-center">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4"
              >
                <Icon name="lucide:activity" class="h-8 w-8 text-orange-600" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Suivi en temps réel
              </h3>
              <p class="text-gray-600">
                Enregistrez vos données de santé quotidiennes : humeur, sommeil,
                activité physique et visualisez votre évolution.
              </p>
            </div>
          </Card>

          <!-- Tableau de bord médecin -->
          <Card class="p-6 hover:shadow-lg transition-shadow">
            <div class="text-center">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4"
              >
                <Icon name="lucide:stethoscope" class="h-8 w-8 text-teal-600" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Espace médecin
              </h3>
              <p class="text-gray-600">
                Les médecins peuvent suivre leurs patients, analyser les données
                de santé et communiquer de manière sécurisée.
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </section>

    <!-- Section utilisateurs cibles -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Une solution pour tous
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Que vous soyez patient, médecin ou administrateur, notre plateforme
            s'adapte à vos besoins spécifiques.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Pour les patients -->
          <Card class="p-8 text-center hover:shadow-lg transition-shadow">
            <div
              class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6"
            >
              <Icon name="lucide:user" class="h-10 w-10 text-blue-600" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              Pour les Patients
            </h3>
            <p class="text-gray-600 mb-6">
              Suivez votre santé au quotidien, analysez vos habitudes avec l'IA
              et communiquez facilement avec vos médecins.
            </p>
            <ul class="text-left space-y-2 text-gray-600">
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Saisie de données de santé
              </li>
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Analyse IA des repas par photo
              </li>
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Chatbot santé intelligent
              </li>
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Gestion des consentements
              </li>
            </ul>
          </Card>

          <!-- Pour les médecins -->
          <Card
            class="p-8 text-center hover:shadow-lg transition-shadow border-blue-200 bg-blue-50"
          >
            <div
              class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6"
            >
              <Icon name="lucide:stethoscope" class="h-10 w-10 text-blue-600" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              Pour les Médecins
            </h3>
            <p class="text-gray-600 mb-6">
              Suivez vos patients à distance, consultez leurs données de santé
              et communiquez de manière sécurisée.
            </p>
            <ul class="text-left space-y-2 text-gray-600">
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Tableau de bord patients
              </li>
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Accès aux données avec consentement
              </li>
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Messagerie sécurisée
              </li>
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Analyses IA simplifiées
              </li>
            </ul>
          </Card>

          <!-- Pour les administrateurs -->
          <Card class="p-8 text-center hover:shadow-lg transition-shadow">
            <div
              class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6"
            >
              <Icon name="lucide:shield" class="h-10 w-10 text-gray-600" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              Pour les Administrateurs
            </h3>
            <p class="text-gray-600 mb-6">
              Gérez la plateforme, les utilisateurs et surveillez les
              statistiques d'utilisation en toute sécurité.
            </p>
            <ul class="text-left space-y-2 text-gray-600">
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Gestion des utilisateurs
              </li>
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Validation des médecins
              </li>
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Monitoring plateforme
              </li>
              <li class="flex items-center">
                <Icon name="lucide:check" class="h-4 w-4 text-green-500 mr-2" />
                Statistiques d'utilisation
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>

    <!-- Section sécurité et confidentialité -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sécurité et confidentialité
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Vos données de santé sont protégées par les plus hauts standards de
            sécurité et de confidentialité.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
            >
              <Icon name="lucide:lock" class="h-8 w-8 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Chiffrement end-to-end
            </h3>
            <p class="text-gray-600">
              Toutes vos données sont chiffrées et protégées selon les standards
              médicaux les plus stricts.
            </p>
          </div>

          <div class="text-center">
            <div
              class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4"
            >
              <Icon name="lucide:check-circle" class="h-8 w-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Conformité RGPD
            </h3>
            <p class="text-gray-600">
              Notre plateforme respecte toutes les réglementations en matière de
              protection des données personnelles.
            </p>
          </div>

          <div class="text-center">
            <div
              class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4"
            >
              <Icon name="lucide:user-check" class="h-8 w-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Contrôle total
            </h3>
            <p class="text-gray-600">
              Vous gardez le contrôle complet sur qui peut accéder à vos données
              et à quelles conditions.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action final -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Prêt à commencer votre parcours santé ?
        </h2>
        <p class="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Rejoignez dès maintenant la révolution du suivi de santé intelligent
          et prenez le contrôle de votre bien-être.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/auth/register">
            <Button
              size="lg"
              class="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 font-semibold"
            >
              <Icon name="lucide:user-plus" class="h-5 w-5 mr-2" />
              Créer un compte gratuit
            </Button>
          </NuxtLink>
          <NuxtLink to="/auth/login">
            <Button
              size="lg"
              variant="outline"
              class="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4"
            >
              <Icon name="lucide:log-in" class="h-5 w-5 mr-2" />
              J'ai déjà un compte
            </Button>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div class="flex items-center justify-center mb-4">
            <Icon name="lucide:heart-pulse" class="h-8 w-8 text-blue-400" />
            <span class="ml-2 text-xl font-bold">Suivi Santé IA</span>
          </div>
          <p class="text-gray-400 mb-6">
            Projet de fin d'études en Master IA - Démonstration de faisabilité
            technique
          </p>
          <div class="flex justify-center space-x-6 text-sm text-gray-400">
            <span>© 2025 Suivi Santé IA</span>
            <span>•</span>
            <span>Données sécurisées</span>
            <span>•</span>
            <span>Conformité RGPD</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

// Fonction pour faire défiler vers les fonctionnalités
const scrollToFeatures = () => {
  const element = document.getElementById("features");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

// Meta données de la page
definePageMeta({
  title: "Accueil - Suivi Santé IA",
  middleware: "guest",
});

// SEO meta
useSeoMeta({
  title: "Suivi Santé IA - Votre santé intelligemment suivie",
  description:
    "Plateforme complète de suivi de santé utilisant l'intelligence artificielle. Analyse de repas par photo, chatbot santé, communication sécurisée médecin-patient.",
  keywords:
    "santé, IA, intelligence artificielle, suivi médical, télémédecine, analyse repas, chatbot santé",
  ogTitle: "Suivi Santé IA - Révolutionnez votre suivi de santé",
  ogDescription:
    "Découvrez comment l'IA peut transformer votre approche de la santé avec des outils intelligents et personnalisés.",
  ogImage: "/og-image.jpg",
  twitterCard: "summary_large_image",
});
</script>
