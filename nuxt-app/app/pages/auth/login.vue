<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Skip link for accessibility -->
      <SkipLink href="#login-form" />

      <!-- Header with proper heading structure -->
      <div>
        <h1 class="sr-only">Connexion - Suivi Santé IA</h1>
        <Card class="w-full">
          <CardHeader class="space-y-1">
            <CardTitle id="login-title" class="text-2xl font-bold text-center">
              Connexion
            </CardTitle>
            <CardDescription class="text-center">
              Entrez vos identifiants pour vous connecter à votre compte
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="login-form"
              class="space-y-4"
              role="form"
              aria-labelledby="login-title"
              novalidate
              @submit="onSubmit"
            >
              <FormField v-slot="{ componentField }" name="email">
                <FormItem>
                  <FormLabel for="email-input">Email *</FormLabel>
                  <FormControl>
                    <Input
                      id="email-input"
                      type="email"
                      placeholder="votre@email.com"
                      v-bind="componentField"
                      autocomplete="email"
                      required
                      aria-describedby="email-error"
                    />
                  </FormControl>
                  <FormMessage
                    id="email-error"
                    role="alert"
                    aria-live="polite"
                  />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="password">
                <FormItem>
                  <FormLabel for="password-input">Mot de passe *</FormLabel>
                  <FormControl>
                    <Input
                      id="password-input"
                      type="password"
                      placeholder="Votre mot de passe"
                      v-bind="componentField"
                      autocomplete="current-password"
                      required
                      aria-describedby="password-error"
                    />
                  </FormControl>
                  <FormMessage
                    id="password-error"
                    role="alert"
                    aria-live="polite"
                  />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="role">
                <FormItem>
                  <FormLabel for="role-select">Type de compte *</FormLabel>
                  <FormControl>
                    <select
                      v-bind="componentField"
                      id="role-select"
                      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-describedby="role-error"
                      required
                    >
                      <option value="">Sélectionnez votre rôle</option>
                      <option value="patient">Patient</option>
                      <option value="doctor">Médecin</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </FormControl>
                  <FormMessage
                    id="role-error"
                    role="alert"
                    aria-live="polite"
                  />
                </FormItem>
              </FormField>

              <Button
                type="submit"
                class="w-full"
                :disabled="isLoading"
                :aria-label="
                  isLoading ? 'Connexion en cours...' : 'Se connecter'
                "
              >
                <Icon
                  v-if="isLoading"
                  name="lucide:loader-2"
                  class="mr-2 h-4 w-4 animate-spin"
                />
                {{ isLoading ? "Connexion..." : "Se connecter" }}
              </Button>
            </form>

            <!-- Registration link with better accessibility -->
            <div class="mt-4 text-center text-sm">
              <span class="text-gray-600">Pas encore de compte ? </span>
              <NuxtLink
                to="/auth/register"
                class="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-1"
                aria-label="Créer un nouveau compte"
              >
                S'inscrire
              </NuxtLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SkipLink } from "@/components/ui/skip-link";

// Métadonnées de la page
definePageMeta({
  layout: "auth",
  middleware: "guest",
});

// Configuration SEO
useSeoMeta({
  title: "Connexion - Suivi Santé IA",
  description:
    "Connectez-vous à votre compte Suivi Santé IA pour accéder à votre espace personnalisé de suivi de santé.",
});

// Schéma de validation
const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Email invalide").min(1, "Email requis"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    role: z
      .enum(["patient", "doctor", "admin"], {
        required_error: "Veuillez sélectionner un rôle",
      })
      .optional(),
  })
);

// Configuration du formulaire
const form = useForm({
  validationSchema: formSchema,
});

// États réactifs
const { signIn, redirectToDashboard, isLoading } = useAuth();
const toastStore = useToastStore();

// Gestion de la soumission
const onSubmit = form.handleSubmit(async (values) => {
  try {
    console.log(
      "Tentative de connexion pour:",
      values.email,
      "avec le rôle:",
      values.role
    );

    const { data, error } = await signIn(values.email, values.password);

    if (error) {
      console.error("Erreur de connexion:", error);
      toastStore.error(
        (error as any)?.message || "Erreur de connexion inconnue"
      );
    } else if (data?.user) {
      console.log("Connexion réussie, redirection en cours...");
      toastStore.success("Connexion réussie ! Redirection en cours...");

      // Attendre un peu plus longtemps pour que tous les états soient synchronisés
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirection vers le dashboard selon le rôle
      await redirectToDashboard();
    } else {
      console.error("Données utilisateur manquantes");
      toastStore.error("Erreur de connexion : données utilisateur manquantes");
    }
  } catch (error: any) {
    console.error("Erreur lors de la connexion:", error);
    toastStore.error(
      error?.message || "Une erreur est survenue lors de la connexion"
    );
  }
});
</script>
