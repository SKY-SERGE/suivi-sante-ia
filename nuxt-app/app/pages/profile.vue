<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Contenu principal -->
    <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="space-y-8">
        <!-- En-tête -->
        <div>
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            Mon profil
          </h1>
          <p class="mt-2 text-sm text-gray-600">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>
        <!-- Formulaire de profil -->
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form class="space-y-6" @submit="onSubmit">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField v-slot="{ componentField }" name="first_name">
                  <FormItem>
                    <FormLabel
                      >Prénom <span class="text-red-500">*</span></FormLabel
                    >
                    <FormControl>
                      <Input
                        placeholder="Votre prénom"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="last_name">
                  <FormItem>
                    <FormLabel
                      >Nom <span class="text-red-500">*</span></FormLabel
                    >
                    <FormControl>
                      <Input placeholder="Votre nom" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField name="email">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        :value="userEmail"
                        type="email"
                        readonly
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      L'email ne peut pas être modifié depuis cette interface.
                    </FormDescription>
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="phone">
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="06 12 34 56 78"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="date_of_birth">
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl>
                      <Input type="date" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <!-- Champs spécifiques aux médecins -->
                <FormField
                  v-if="userRole === 'doctor'"
                  v-slot="{ componentField }"
                  name="specialization"
                >
                  <FormItem>
                    <FormLabel>Spécialisation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Votre spécialité médicale"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField
                  v-if="userRole === 'doctor'"
                  v-slot="{ componentField }"
                  name="medical_license"
                >
                  <FormItem>
                    <FormLabel>Numéro de licence médicale</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Votre numéro de licence"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
              <div class="flex justify-end space-x-3">
                <Button type="button" variant="outline" @click="resetForm">
                  Annuler
                </Button>
                <Button type="submit" :disabled="isLoading">
                  <Icon
                    v-if="isLoading"
                    name="lucide:loader-2"
                    class="w-4 h-4 mr-2 animate-spin"
                  />
                  Mettre à jour
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Section changement de mot de passe -->
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-4">
              Changez votre mot de passe en cliquant sur le bouton ci-dessous.
              Un email vous sera envoyé avec les instructions.
            </p>
            <Button variant="outline" @click="changePassword">
              <Icon name="lucide:key" class="w-4 h-4 mr-2" />
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// Composants Shadcn Vue
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Middleware et meta
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
  title: "Mon profil",
});

// Composables
const {
  userProfile,
  userRole,
  loadUserProfile,
  updateProfile: updateUserProfile,
  updatePassword: updateUserPassword,
} = useUserProfile();
const { user, userEmail, firstName, lastName } = useUser();
const toast = useToast();
const toastStore = useToastStore();

// État réactif
const isLoading = ref(false);

// Schéma de validation avec Zod
const profileSchema = toTypedSchema(
  z.object({
    first_name: z.string().min(1, "Le prénom est requis"),
    last_name: z.string().min(1, "Le nom est requis"),
    phone: z
      .string()
      .regex(/^(?:\+33|0)[1-9](?:[0-9]{8})$/, "Format de téléphone invalide")
      .optional()
      .or(z.literal("")),
    date_of_birth: z.string().optional(),
    specialization: z.string().optional(),
    medical_license: z.string().optional(),
  })
);

// Configuration du formulaire avec vee-validate
const form = useForm({
  validationSchema: profileSchema,
  initialValues: {
    first_name: firstName.value || "",
    last_name: lastName.value || "",
    phone: userProfile.value?.phone || "",
    date_of_birth: userProfile.value?.date_of_birth || "",
    specialization: userProfile.value?.specialization || "",
    medical_license: userProfile.value?.medical_license || "",
  },
});

// Fonction de soumission du formulaire
const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true;

  try {
    const { error } = await updateUserProfile(values);

    if (error) {
      toastStore.error(
        "Erreur lors de la mise à jour du profil: " + error.message
      );
    } else {
      toastStore.success("Profil mis à jour avec succès !");
      await loadUserProfile();
    }
  } catch (error: any) {
    toastStore.error("Une erreur inattendue est survenue: " + error.message);
  } finally {
    isLoading.value = false;
  }
});

// Réinitialiser le formulaire
const resetForm = () => {
  window.location.reload();
};

// Changer le mot de passe
const changePassword = async () => {
  try {
    const result = await updateUserPassword(userEmail.value);

    if (result?.error) {
      toastStore.error("Erreur lors de l'envoi de l'email: " + result.error);
    } else {
      toastStore.success(
        "Email de réinitialisation envoyé ! Vérifiez votre boîte mail."
      );
    }
  } catch (error: any) {
    toastStore.error("Une erreur inattendue est survenue: " + error.message);
  }
};

// Initialisation
onMounted(async () => {
  await loadUserProfile();

  // Mettre à jour les valeurs du formulaire après le chargement du profil
  form.setValues({
    first_name: firstName.value || "",
    last_name: lastName.value || "",
    phone: userProfile.value?.phone || "",
    date_of_birth: userProfile.value?.date_of_birth || "",
    specialization: userProfile.value?.specialization || "",
    medical_license: userProfile.value?.medical_license || "",
  });
});
</script>
