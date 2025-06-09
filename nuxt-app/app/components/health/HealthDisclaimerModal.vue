<template>
  <Dialog :open="isOpen" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <Icon name="lucide:shield-alert" class="w-5 h-5 text-yellow-600" />
          <span>Avis important - Limitations du chatbot santé</span>
        </DialogTitle>
        <DialogDescription>
          Veuillez lire attentivement les informations suivantes avant
          d'utiliser le chatbot santé.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Section principale -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-start space-x-3">
            <Icon
              name="lucide:alert-triangle"
              class="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0"
            />
            <div>
              <h3 class="font-semibold text-yellow-900 mb-2">
                Ce chatbot ne remplace PAS un avis médical professionnel
              </h3>
              <p class="text-sm text-yellow-800">
                Les informations fournies par ce chatbot sont à des fins
                éducatives uniquement et ne constituent pas un diagnostic, un
                traitement ou un conseil médical personnalisé.
              </p>
            </div>
          </div>
        </div>

        <!-- Limitations techniques -->
        <div>
          <h3
            class="font-semibold text-gray-900 mb-3 flex items-center space-x-2"
          >
            <Icon name="lucide:cpu" class="w-4 h-4" />
            <span>Limitations techniques</span>
          </h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start space-x-2">
              <Icon name="lucide:dot" class="w-4 h-4 mt-0.5 text-gray-400" />
              <span
                >L'IA peut générer des informations inexactes ou
                incomplètes</span
              >
            </li>
            <li class="flex items-start space-x-2">
              <Icon name="lucide:dot" class="w-4 h-4 mt-0.5 text-gray-400" />
              <span
                >Les réponses sont basées sur des données générales, pas sur
                votre situation personnelle</span
              >
            </li>
            <li class="flex items-start space-x-2">
              <Icon name="lucide:dot" class="w-4 h-4 mt-0.5 text-gray-400" />
              <span
                >Le système ne peut pas accéder à vos données médicales
                personnelles</span
              >
            </li>
            <li class="flex items-start space-x-2">
              <Icon name="lucide:dot" class="w-4 h-4 mt-0.5 text-gray-400" />
              <span
                >Les informations peuvent ne pas être à jour avec les dernières
                recherches médicales</span
              >
            </li>
          </ul>
        </div>

        <!-- Quand consulter un professionnel -->
        <div>
          <h3
            class="font-semibold text-gray-900 mb-3 flex items-center space-x-2"
          >
            <Icon name="lucide:stethoscope" class="w-4 h-4" />
            <span>Consultez toujours un professionnel de santé pour :</span>
          </h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start space-x-2">
              <Icon name="lucide:check" class="w-4 h-4 mt-0.5 text-green-600" />
              <span>Tout diagnostic ou traitement médical</span>
            </li>
            <li class="flex items-start space-x-2">
              <Icon name="lucide:check" class="w-4 h-4 mt-0.5 text-green-600" />
              <span>Des symptômes persistants ou inquiétants</span>
            </li>
            <li class="flex items-start space-x-2">
              <Icon name="lucide:check" class="w-4 h-4 mt-0.5 text-green-600" />
              <span>Toute modification de vos médicaments</span>
            </li>
            <li class="flex items-start space-x-2">
              <Icon name="lucide:check" class="w-4 h-4 mt-0.5 text-green-600" />
              <span>Questions spécifiques à votre condition médicale</span>
            </li>
          </ul>
        </div>

        <!-- Situations d'urgence -->
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3
            class="font-semibold text-red-900 mb-3 flex items-center space-x-2"
          >
            <Icon name="lucide:phone" class="w-4 h-4" />
            <span>En cas d'urgence</span>
          </h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <Button variant="destructive" size="sm" class="font-bold">
                <Icon name="lucide:phone" class="w-4 h-4 mr-2" />
                15 - SAMU
              </Button>
              <span class="text-sm text-red-800">Urgences médicales</span>
            </div>
            <div class="flex items-center space-x-3">
              <Button variant="destructive" size="sm" class="font-bold">
                <Icon name="lucide:phone" class="w-4 h-4 mr-2" />
                112 - Urgences
              </Button>
              <span class="text-sm text-red-800"
                >Numéro d'urgence européen</span
              >
            </div>
            <p class="text-xs text-red-700 mt-2">
              N'utilisez jamais ce chatbot pour des situations d'urgence.
              Appelez immédiatement les services d'urgence.
            </p>
          </div>
        </div>

        <!-- Confidentialité et données -->
        <div>
          <h3
            class="font-semibold text-gray-900 mb-3 flex items-center space-x-2"
          >
            <Icon name="lucide:shield" class="w-4 h-4" />
            <span>Confidentialité et protection des données</span>
          </h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start space-x-2">
              <Icon name="lucide:lock" class="w-4 h-4 mt-0.5 text-blue-600" />
              <span>Vos conversations sont chiffrées et sécurisées</span>
            </li>
            <li class="flex items-start space-x-2">
              <Icon
                name="lucide:eye-off"
                class="w-4 h-4 mt-0.5 text-blue-600"
              />
              <span
                >Évitez de partager des informations médicales sensibles</span
              >
            </li>
            <li class="flex items-start space-x-2">
              <Icon
                name="lucide:trash-2"
                class="w-4 h-4 mt-0.5 text-blue-600"
              />
              <span
                >Les conversations peuvent être supprimées à tout moment</span
              >
            </li>
          </ul>
        </div>

        <!-- Checkbox de consentement -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <label class="flex items-start space-x-3 cursor-pointer">
            <Checkbox
              :checked="hasAgreed"
              @update:checked="hasAgreed = $event"
              class="mt-1"
            />
            <div class="text-sm">
              <span class="text-gray-900">
                J'ai lu et je comprends les limitations de ce chatbot santé. Je
                m'engage à consulter un professionnel de santé pour tout conseil
                médical personnalisé.
              </span>
            </div>
          </label>
        </div>
      </div>

      <DialogFooter class="flex justify-between">
        <Button variant="outline" @click="$emit('update:open', false)">
          Annuler
        </Button>
        <Button
          @click="acceptDisclaimer"
          :disabled="!hasAgreed"
          class="bg-blue-600 hover:bg-blue-700"
        >
          <Icon name="lucide:check" class="w-4 h-4 mr-2" />
          J'accepte et je continue
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
}

interface Emits {
  (event: "update:open", value: boolean): void;
  (event: "accepted"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const hasAgreed = ref(false);

const acceptDisclaimer = () => {
  if (hasAgreed.value) {
    emit("accepted");
    emit("update:open", false);
  }
};

// Reset checkbox when modal closes
watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      hasAgreed.value = false;
    }
  }
);
</script>
