<template>
  <div class="container mx-auto p-6">
    <!-- En-tête -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Messages sécurisés</h1>
          <p class="mt-2 text-gray-600">
            Communiquez en toute sécurité avec vos médecins
          </p>
        </div>
        <div class="flex gap-3">
          <Button
            @click="showComposeModal = true"
            class="flex items-center gap-2"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Nouveau message
          </Button>
          <NuxtLink to="/patient/dashboard">
            <Button variant="outline" class="flex items-center gap-2">
              <Icon name="lucide:arrow-left" class="h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Navigation rapide -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-3">
        <Button
          :variant="activeTab === 'inbox' ? 'default' : 'ghost'"
          size="sm"
          class="flex items-center gap-2"
          @click="activeTab = 'inbox'"
        >
          <Icon name="lucide:inbox" class="h-4 w-4" />
          Boîte de réception ({{ unreadCount }})
        </Button>
        <Button
          :variant="activeTab === 'sent' ? 'default' : 'ghost'"
          size="sm"
          class="flex items-center gap-2"
          @click="activeTab = 'sent'"
        >
          <Icon name="lucide:send" class="h-4 w-4" />
          Messages envoyés
        </Button>
        <Button
          :variant="activeTab === 'archived' ? 'default' : 'ghost'"
          size="sm"
          class="flex items-center gap-2"
          @click="activeTab = 'archived'"
        >
          <Icon name="lucide:archive" class="h-4 w-4" />
          Archivés
        </Button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <div class="text-center">
        <Icon
          name="lucide:loader-2"
          class="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600"
        />
        <p class="text-gray-600">Chargement de vos messages...</p>
      </div>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="text-center py-12">
      <Card class="max-w-md mx-auto">
        <CardContent class="pt-6">
          <Icon
            name="lucide:alert-circle"
            class="h-12 w-12 text-red-500 mx-auto mb-4"
          />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p class="text-gray-600 mb-4">Impossible de charger vos messages.</p>
          <Button @click="refresh()" class="flex items-center gap-2 mx-auto">
            <Icon name="lucide:refresh-cw" class="h-4 w-4" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Liste des conversations -->
    <div v-else class="grid lg:grid-cols-3 gap-6">
      <!-- Liste des conversations -->
      <div class="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:message-circle" class="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent class="p-0">
            <div
              v-if="filteredConversations.length === 0"
              class="p-6 text-center"
            >
              <Icon
                name="lucide:message-square"
                class="h-12 w-12 text-gray-400 mx-auto mb-4"
              />
              <p class="text-gray-600">Aucune conversation trouvée</p>
              <Button @click="showComposeModal = true" size="sm" class="mt-4">
                Envoyer votre premier message
              </Button>
            </div>
            <div v-else class="divide-y">
              <div
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{
                  'bg-blue-50 border-l-4 border-blue-500':
                    selectedConversation?.id === conversation.id,
                }"
                @click="selectConversation(conversation)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="font-medium text-gray-900">
                        Dr. {{ conversation.doctor_name }}
                      </h4>
                      <span
                        v-if="
                          !conversation.is_read &&
                          conversation.sender_role !== 'patient'
                        "
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        Nouveau
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                      {{ conversation.subject || "Sujet: Discussion générale" }}
                    </p>
                    <p class="text-xs text-gray-500 mt-2">
                      {{ formatDate(conversation.created_at) }}
                    </p>
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <Icon
                      v-if="conversation.is_urgent"
                      name="lucide:alert-triangle"
                      class="h-4 w-4 text-red-500"
                    />
                    <Icon
                      v-if="conversation.is_encrypted"
                      name="lucide:shield-check"
                      class="h-4 w-4 text-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Vue de la conversation sélectionnée -->
      <div class="lg:col-span-2">
        <Card v-if="selectedConversation" class="h-[600px] flex flex-col">
          <CardHeader class="flex-none">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="flex items-center gap-2">
                  <Icon name="lucide:user-round" class="h-5 w-5" />
                  Dr. {{ selectedConversation.doctor_name }}
                </CardTitle>
                <p class="text-sm text-gray-600 mt-1">
                  {{ selectedConversation.subject || "Discussion générale" }}
                </p>
              </div>
              <div class="flex gap-2">
                <Button
                  @click="archiveConversation"
                  variant="outline"
                  size="sm"
                  class="flex items-center gap-2"
                >
                  <Icon name="lucide:archive" class="h-4 w-4" />
                  Archiver
                </Button>
                <Button
                  @click="markAsUrgent"
                  variant="outline"
                  size="sm"
                  class="flex items-center gap-2"
                  :class="{
                    'text-red-600 border-red-300':
                      selectedConversation.is_urgent,
                  }"
                >
                  <Icon name="lucide:alert-triangle" class="h-4 w-4" />
                  {{
                    selectedConversation.is_urgent ? "Urgent" : "Marquer urgent"
                  }}
                </Button>
              </div>
            </div>
          </CardHeader>

          <!-- Messages de la conversation -->
          <CardContent class="flex-1 overflow-y-auto">
            <div class="space-y-4">
              <div
                v-for="message in conversationMessages"
                :key="message.id"
                class="flex"
                :class="{
                  'justify-end': message.sender_role === 'patient',
                  'justify-start': message.sender_role === 'doctor',
                }"
              >
                <div
                  class="max-w-[70%] rounded-lg p-4"
                  :class="{
                    'bg-blue-600 text-white': message.sender_role === 'patient',
                    'bg-gray-100 text-gray-900':
                      message.sender_role === 'doctor',
                  }"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs opacity-75">
                      {{
                        message.sender_role === "patient"
                          ? "Vous"
                          : `Dr. ${selectedConversation.doctor_name}`
                      }}
                    </span>
                    <span class="text-xs opacity-75">
                      {{ formatTime(message.created_at) }}
                    </span>
                    <Icon
                      v-if="message.is_encrypted"
                      name="lucide:shield-check"
                      class="h-3 w-3 opacity-75"
                    />
                  </div>
                  <p class="text-sm">{{ message.content }}</p>
                </div>
              </div>
            </div>
          </CardContent>

          <!-- Zone de réponse -->
          <CardContent class="flex-none border-t">
            <form @submit.prevent="sendReply" class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <textarea
                    v-model="replyMessage"
                    placeholder="Écrivez votre réponse..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    :disabled="sending"
                  />
                </div>
                <Button
                  type="submit"
                  :disabled="!replyMessage.trim() || sending"
                  class="flex items-center gap-2"
                >
                  <Icon
                    :name="sending ? 'lucide:loader-2' : 'lucide:send'"
                    class="h-4 w-4"
                    :class="{ 'animate-spin': sending }"
                  />
                  Envoyer
                </Button>
              </div>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    v-model="isUrgentReply"
                    type="checkbox"
                    class="rounded"
                  />
                  Marquer comme urgent
                </label>
                <div class="flex items-center gap-2 text-sm text-green-600">
                  <Icon name="lucide:shield-check" class="h-4 w-4" />
                  Message chiffré
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- État vide -->
        <Card v-else class="h-[600px] flex items-center justify-center">
          <div class="text-center">
            <Icon
              name="lucide:message-square"
              class="h-16 w-16 text-gray-400 mx-auto mb-4"
            />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Sélectionnez une conversation
            </h3>
            <p class="text-gray-600 mb-4">
              Choisissez une conversation pour voir les messages
            </p>
            <Button @click="showComposeModal = true"> Nouveau message </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- Modal de composition -->
    <div
      v-if="showComposeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showComposeModal = false"
    >
      <Card class="max-w-lg w-full mx-4">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Nouveau message</CardTitle>
            <Button @click="showComposeModal = false" variant="ghost" size="sm">
              <Icon name="lucide:x" class="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="sendNewMessage" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Médecin destinataire
              </label>
              <select
                v-model="newMessage.doctorId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez un médecin</option>
                <option
                  v-for="doctor in linkedDoctors"
                  :key="doctor.id"
                  :value="doctor.id"
                >
                  Dr. {{ doctor.first_name }} {{ doctor.last_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sujet
              </label>
              <input
                v-model="newMessage.subject"
                type="text"
                placeholder="Sujet du message"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                v-model="newMessage.content"
                placeholder="Votre message..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="6"
                required
              />
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm text-gray-600">
                <input
                  v-model="newMessage.isUrgent"
                  type="checkbox"
                  class="rounded"
                />
                Message urgent
              </label>
              <div class="flex items-center gap-2 text-sm text-green-600">
                <Icon name="lucide:shield-check" class="h-4 w-4" />
                Chiffrement automatique
              </div>
            </div>
            <div class="flex gap-3 pt-4">
              <Button
                type="submit"
                :disabled="sending"
                class="flex-1 flex items-center justify-center gap-2"
              >
                <Icon
                  :name="sending ? 'lucide:loader-2' : 'lucide:send'"
                  class="h-4 w-4"
                  :class="{ 'animate-spin': sending }"
                />
                Envoyer le message
              </Button>
              <Button
                @click="showComposeModal = false"
                variant="outline"
                type="button"
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// Métadonnées de la page
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
  roles: ["patient"],
});

// État de l'interface
const activeTab = ref("inbox");
const showComposeModal = ref(false);
const selectedConversation = ref<any>(null);
const replyMessage = ref("");
const isUrgentReply = ref(false);
const sending = ref(false);

// Données des messages
const conversations = ref<any[]>([]);
const conversationMessages = ref<any[]>([]);
const linkedDoctors = ref<any[]>([]);

// Nouveau message
const newMessage = ref({
  doctorId: "",
  subject: "",
  content: "",
  isUrgent: false,
});

// Chargement et erreurs
const pending = ref(true);
const error = ref<string | null>(null);

// Composables
const supabaseClient = useSupabaseClient();
const { user, userId } = useUser();
const toast = useToastStore();
const {
  sendSecureMessage,
  validateMessageContent,
  validateSubject,
  verifyMessageIntegrity,
  logSecurityEvent,
} = useSecureMessaging();

// Computed
const unreadCount = computed(
  () =>
    conversations.value.filter((c) => !c.is_read && c.sender_role !== "patient")
      .length
);

const filteredConversations = computed(() => {
  switch (activeTab.value) {
    case "sent":
      return conversations.value.filter((c) => c.sender_role === "patient");
    case "archived":
      return conversations.value.filter((c) => c.is_archived);
    default:
      return conversations.value.filter((c) => !c.is_archived);
  }
});

// Méthodes
async function loadConversations() {
  try {
    pending.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabaseClient
      .from("secure_messages")
      .select(
        `
        *,
        doctor:users!secure_messages_doctor_id_fkey(
          first_name,
          last_name
        )
      `
      )
      .or(`patient_id.eq.${userId.value},doctor_id.eq.${userId.value}`)
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    // Grouper par conversation et prendre le message le plus récent de chaque groupe
    const conversationsMap = new Map();

    data?.forEach((message) => {
      const otherUserId =
        message.patient_id === userId.value
          ? message.doctor_id
          : message.patient_id;

      if (
        !conversationsMap.has(otherUserId) ||
        new Date(message.created_at) >
          new Date(conversationsMap.get(otherUserId).created_at)
      ) {
        conversationsMap.set(otherUserId, {
          ...message,
          doctor_name: message.doctor
            ? `${message.doctor.first_name} ${message.doctor.last_name}`
            : "Médecin inconnu",
        });
      }
    });

    conversations.value = Array.from(conversationsMap.values());
  } catch (err) {
    console.error("Erreur lors du chargement des conversations:", err);
    error.value = "Impossible de charger les conversations";
    toast.error(
      "Erreur de chargement",
      "Impossible de charger vos conversations"
    );
  } finally {
    pending.value = false;
  }
}

async function loadLinkedDoctors() {
  try {
    const { data, error: fetchError } = await supabaseClient
      .from("patient_doctor_consents")
      .select(
        `
        doctor_id,
        doctor:profiles!patient_doctor_consents_doctor_id_fkey(
          id,
          first_name,
          last_name        )
      `
      )
      .eq("patient_id", userId.value)
      .eq("status", "granted");

    if (fetchError) throw fetchError;

    linkedDoctors.value =
      data?.map((item: any) => ({
        id: item.doctor_id,
        first_name: Array.isArray(item.doctor)
          ? item.doctor[0]?.first_name
          : item.doctor?.first_name,
        last_name: Array.isArray(item.doctor)
          ? item.doctor[0]?.last_name
          : item.doctor?.last_name,
      })) || [];
  } catch (err) {
    console.error("Erreur lors du chargement des médecins:", err);
  }
}

async function selectConversation(conversation: any) {
  selectedConversation.value = conversation;

  try {
    const { data, error: fetchError } = await supabaseClient
      .from("secure_messages")
      .select("*")
      .or(
        `
        and(patient_id.eq.${userId.value},doctor_id.eq.${conversation.doctor_id}),
        and(patient_id.eq.${conversation.patient_id},doctor_id.eq.${userId.value})
      `
      )
      .order("created_at", { ascending: true });

    if (fetchError) throw fetchError;

    conversationMessages.value = data || [];

    // Marquer comme lu
    if (!conversation.is_read && conversation.sender_role !== "patient") {
      await supabaseClient
        .from("secure_messages")
        .update({ is_read: true })
        .eq("id", conversation.id);

      conversation.is_read = true;
    }
  } catch (err) {
    console.error("Erreur lors du chargement des messages:", err);
    toast.error(
      "Erreur",
      "Impossible de charger les messages de cette conversation"
    );
  }
}

async function sendReply() {
  if (!replyMessage.value.trim() || !selectedConversation.value) return;

  try {
    sending.value = true;

    // Utilisation du composable sécurisé
    const result = await sendSecureMessage({
      patient_id: userId.value!,
      doctor_id: selectedConversation.value.doctor_id,
      content: replyMessage.value.trim(),
      subject: selectedConversation.value.subject || "Discussion générale",
      sender_role: "patient",
      is_urgent: isUrgentReply.value,
    });

    if (result.success) {
      toast.success(
        "Message envoyé",
        "Votre réponse a été envoyée avec succès"
      );
      replyMessage.value = "";
      isUrgentReply.value = false;
      await selectConversation(selectedConversation.value);
    } else {
      toast.error(
        "Erreur d'envoi",
        result.error || "Impossible d'envoyer votre message"
      );
    }
  } catch (err) {
    console.error("Erreur lors de l'envoi:", err);
    logSecurityEvent("FAILED_MESSAGE_SEND", { error: err });
    toast.error("Erreur d'envoi", "Impossible d'envoyer votre message");
  } finally {
    sending.value = false;
  }
}

async function sendNewMessage() {
  if (!newMessage.value.doctorId || !newMessage.value.content.trim()) return;

  try {
    sending.value = true;

    const { error: insertError } = await supabaseClient
      .from("secure_messages")
      .insert({
        patient_id: userId.value,
        doctor_id: newMessage.value.doctorId,
        content: newMessage.value.content.trim(),
        subject: newMessage.value.subject.trim() || "Discussion générale",
        sender_role: "patient",
        is_urgent: newMessage.value.isUrgent,
        is_encrypted: true,
      });

    if (insertError) throw insertError;

    toast.success("Message envoyé", "Votre message a été envoyé avec succès");

    newMessage.value = {
      doctorId: "",
      subject: "",
      content: "",
      isUrgent: false,
    };
    showComposeModal.value = false;

    await loadConversations();
  } catch (err) {
    console.error("Erreur lors de l'envoi:", err);
    toast.error("Erreur d'envoi", "Impossible d'envoyer votre message");
  } finally {
    sending.value = false;
  }
}

async function archiveConversation() {
  if (!selectedConversation.value) return;

  try {
    const { error: updateError } = await supabaseClient
      .from("secure_messages")
      .update({ is_archived: true })
      .eq("id", selectedConversation.value.id);

    if (updateError) throw updateError;

    toast.success("Conversation archivée", "La conversation a été archivée");
    selectedConversation.value = null;
    await loadConversations();
  } catch (err) {
    console.error("Erreur lors de l'archivage:", err);
    toast.error("Erreur", "Impossible d'archiver la conversation");
  }
}

async function markAsUrgent() {
  if (!selectedConversation.value) return;

  try {
    const newUrgentStatus = !selectedConversation.value.is_urgent;

    const { error: updateError } = await supabaseClient
      .from("secure_messages")
      .update({ is_urgent: newUrgentStatus })
      .eq("id", selectedConversation.value.id);

    if (updateError) throw updateError;

    selectedConversation.value.is_urgent = newUrgentStatus;
    toast.success(
      newUrgentStatus ? "Marqué comme urgent" : "Urgence retirée",
      `La conversation a été ${
        newUrgentStatus
          ? "marquée comme urgente"
          : "retirée de la liste urgente"
      }`
    );
  } catch (err) {
    console.error("Erreur lors de la modification:", err);
    toast.error("Erreur", "Impossible de modifier le statut urgent");
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
    });
  } else {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  }
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function refresh() {
  await loadConversations();
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadConversations(), loadLinkedDoctors()]);
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
