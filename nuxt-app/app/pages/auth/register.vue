<template>
  <Card class="w-full">
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold text-center">
        Inscription
      </CardTitle>
      <CardDescription class="text-center">
        Créez votre compte pour commencer à utiliser l'application
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form @submit="onSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem>
              <FormLabel>Prénom</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Jean" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Dupont"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="votre@email.com"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Au moins 6 caractères"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="confirmPassword">
          <FormItem>
            <FormLabel>Confirmer le mot de passe</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Répétez votre mot de passe"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="isLoading">
          <Icon
            v-if="isLoading"
            name="lucide:loader-2"
            class="mr-2 h-4 w-4 animate-spin"
          />
          S'inscrire
        </Button>
      </form>

      <div class="mt-4 text-center text-sm">
        <span class="text-gray-600">Déjà un compte ? </span>
        <NuxtLink
          to="/auth/login"
          class="text-blue-600 hover:text-blue-500 font-medium"
        >
          Se connecter
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
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

// Schéma de validation
const formSchema = toTypedSchema(
  z
    .object({
      firstName: z
        .string()
        .min(2, "Le prénom doit contenir au moins 2 caractères"),
      lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
      email: z.string().email("Email invalide").min(1, "Email requis"),
      password: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
      confirmPassword: z.string().min(6, "Confirmation requise"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    })
);

// Configuration du formulaire
const form = useForm({
  validationSchema: formSchema,
});

// États réactifs
const { signUp, isLoading } = useAuth();

// Gestion de la soumission
const onSubmit = form.handleSubmit(async (values) => {
  try {
    const { data, error } = await signUp(values.email, values.password, {
      first_name: values.firstName,
      last_name: values.lastName,
      role: "patient", // Par défaut, rôle patient
    });
    if (error) {
      console.error("Erreur d'inscription:", error);
      alert(
        "Erreur d'inscription : " +
          ((error as any)?.message || "Erreur inconnue")
      );
    } else {
      alert(
        "Inscription réussie ! Vérifiez votre email pour confirmer votre compte."
      );
      await navigateTo("/auth/login");
    }
  } catch (error: any) {
    console.error("Erreur lors de l'inscription:", error);
    alert(error?.message || "Une erreur est survenue lors de l'inscription");
  }
});

// Meta données de la page
definePageMeta({
  layout: "auth",
  title: "Inscription",
  middleware: "guest",
});
</script>
