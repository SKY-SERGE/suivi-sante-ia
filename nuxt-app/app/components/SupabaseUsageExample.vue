<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">Supabase Integration Example</h2>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"
      ></div>
      <p class="mt-2 text-gray-600">Loading...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
    >
      <p class="text-red-800">{{ error.message }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- User Authentication Status -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="font-semibold mb-2">Authentication Status</h3>
        <div v-if="user">
          <p class="text-green-600">✓ Authenticated</p>
          <p class="text-sm text-gray-600 mt-1">Email: {{ user.email }}</p>
          <p class="text-sm text-gray-600">ID: {{ user.id }}</p>
          <button
            @click="handleSignOut"
            class="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div v-else>
          <p class="text-yellow-600">⚠ Not authenticated</p>
          <div class="mt-3">
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="px-3 py-2 border rounded mr-2"
            />
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              class="px-3 py-2 border rounded mr-2"
            />
            <button
              @click="handleSignIn"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      <!-- Data Fetching Example -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="font-semibold mb-2">Data Fetching Example</h3>
        <button
          @click="fetchData"
          :disabled="fetchingData"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {{ fetchingData ? "Fetching..." : "Fetch Sample Data" }}
        </button>

        <div v-if="sampleData" class="mt-3">
          <pre class="bg-white p-3 rounded text-sm overflow-auto">{{
            JSON.stringify(sampleData, null, 2)
          }}</pre>
        </div>
      </div>

      <!-- Real-time Subscription Example -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold mb-2">Real-time Subscription</h3>
        <p class="text-sm text-gray-600 mb-2">
          This example shows how to set up real-time subscriptions (requires
          authenticated user)
        </p>
        <button
          @click="toggleSubscription"
          :disabled="!user"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50"
        >
          {{ isSubscribed ? "Unsubscribe" : "Subscribe to Changes" }}
        </button>

        <div v-if="realtimeMessages.length > 0" class="mt-3">
          <p class="text-sm font-semibold mb-1">Real-time Messages:</p>
          <ul class="space-y-1">
            <li
              v-for="(msg, index) in realtimeMessages"
              :key="index"
              class="text-sm bg-white p-2 rounded"
            >
              {{ msg }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js";

// Use the refactored composables
const supabase = useSupabase();
const { user, isLoading, error, signOut } = useSupabaseUser();

// Local state
const email = ref("");
const password = ref("");
const fetchingData = ref(false);
const sampleData = ref<any>(null);
const isSubscribed = ref(false);
const realtimeMessages = ref<string[]>([]);
const authError = ref<Error | null>(null);
let realtimeChannel: RealtimeChannel | null = null;

// Authentication handlers
const handleSignIn = async () => {
  if (!email.value || !password.value) {
    alert("Please enter email and password");
    return;
  }

  try {
    authError.value = null;
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (signInError) {
      authError.value = signInError;
    } else {
      // Clear form on successful login
      email.value = "";
      password.value = "";
    }
  } catch (err) {
    authError.value = err instanceof Error ? err : new Error("Sign in failed");
  }
};

const handleSignOut = async () => {
  await signOut();
  // Clean up any subscriptions
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
    isSubscribed.value = false;
    realtimeMessages.value = [];
  }
};

// Data fetching example
const fetchData = async () => {
  fetchingData.value = true;
  try {
    // Example: Fetch from a public table or create a sample response
    // Replace 'your_table' with an actual table name in your Supabase project
    const { data, error } = await supabase
      .from("profiles") // Example table
      .select("*")
      .limit(5);

    if (error) {
      // If table doesn't exist, show sample data
      sampleData.value = {
        message: "Replace this with actual data from your Supabase tables",
        timestamp: new Date().toISOString(),
        user: user.value?.email || "Not authenticated",
      };
    } else {
      sampleData.value = data;
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    sampleData.value = {
      error: "Failed to fetch data",
      hint: "Make sure you have tables set up in your Supabase project",
    };
  } finally {
    fetchingData.value = false;
  }
};

// Real-time subscription example
const toggleSubscription = () => {
  if (isSubscribed.value && realtimeChannel) {
    // Unsubscribe
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
    isSubscribed.value = false;
    realtimeMessages.value.push("Unsubscribed from real-time updates");
  } else if (user.value) {
    // Subscribe
    realtimeChannel = supabase
      .channel("example-channel")
      .on("presence", { event: "sync" }, () => {
        realtimeMessages.value.push(
          `Presence sync at ${new Date().toLocaleTimeString()}`
        );
      })
      .on("broadcast", { event: "test" }, (payload) => {
        realtimeMessages.value.push(
          `Broadcast received: ${JSON.stringify(payload)}`
        );
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          isSubscribed.value = true;
          realtimeMessages.value.push(
            "Successfully subscribed to real-time updates"
          );
        }
      });
  }
};

// Cleanup on component unmount
onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
