<template>
  <div
    v-if="notification"
    class="fixed top-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border z-50 animate-in slide-in-from-top-5 duration-300"
    :class="notificationClasses"
    role="alert"
    :aria-live="notification.type === 'error' ? 'assertive' : 'polite'"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <Icon :name="notificationIcon" class="h-5 w-5" :class="iconClasses" />
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="text-sm font-medium" :class="titleClasses">
            {{ notification.title }}
          </p>
          <p
            v-if="notification.message"
            class="mt-1 text-sm"
            :class="messageClasses"
          >
            {{ notification.message }}
          </p>
          <div v-if="notification.actions" class="mt-3 flex space-x-2">
            <button
              v-for="action in notification.actions"
              :key="action.label"
              @click="action.handler"
              class="text-xs font-medium px-2 py-1 rounded transition-colors"
              :class="actionClasses"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            @click="dismissNotification"
            class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Fermer la notification"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Barre de progression pour auto-dismiss -->
    <div
      v-if="notification.autoDismiss && showProgress"
      class="h-1 bg-gray-200 rounded-b-lg overflow-hidden"
    >
      <div
        class="h-full transition-all ease-linear"
        :class="progressBarClasses"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

interface NotificationAction {
  label: string;
  handler: () => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  actions?: NotificationAction[];
  autoDismiss?: number; // en millisecondes
  persistent?: boolean;
}

interface Props {
  notification: Notification | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  dismiss: [id: string];
}>();

const progress = ref(100);
const showProgress = ref(false);
let timer: NodeJS.Timeout | null = null;
let progressTimer: NodeJS.Timeout | null = null;

const notificationClasses = computed(() => {
  if (!props.notification) return "";

  const baseClasses = "border-l-4";
  const typeClasses = {
    success: "border-green-400 bg-green-50",
    error: "border-red-400 bg-red-50",
    warning: "border-yellow-400 bg-yellow-50",
    info: "border-blue-400 bg-blue-50",
  };

  return `${baseClasses} ${typeClasses[props.notification.type]}`;
});

const notificationIcon = computed(() => {
  if (!props.notification) return "";

  const icons = {
    success: "lucide:check-circle",
    error: "lucide:x-circle",
    warning: "lucide:alert-triangle",
    info: "lucide:info",
  };

  return icons[props.notification.type];
});

const iconClasses = computed(() => {
  if (!props.notification) return "";

  const classes = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  return classes[props.notification.type];
});

const titleClasses = computed(() => {
  if (!props.notification) return "";

  const classes = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  };

  return classes[props.notification.type];
});

const messageClasses = computed(() => {
  if (!props.notification) return "";

  const classes = {
    success: "text-green-700",
    error: "text-red-700",
    warning: "text-yellow-700",
    info: "text-blue-700",
  };

  return classes[props.notification.type];
});

const actionClasses = computed(() => {
  if (!props.notification) return "";

  const classes = {
    success: "bg-green-100 text-green-800 hover:bg-green-200",
    error: "bg-red-100 text-red-800 hover:bg-red-200",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    info: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  };

  return classes[props.notification.type];
});

const progressBarClasses = computed(() => {
  if (!props.notification) return "";

  const classes = {
    success: "bg-green-400",
    error: "bg-red-400",
    warning: "bg-yellow-400",
    info: "bg-blue-400",
  };

  return classes[props.notification.type];
});

const dismissNotification = () => {
  if (props.notification) {
    emit("dismiss", props.notification.id);
  }
};

const startAutoDismiss = () => {
  if (!props.notification?.autoDismiss) return;

  showProgress.value = true;
  progress.value = 100;

  const duration = props.notification.autoDismiss;
  const interval = 50; // Update every 50ms
  const steps = duration / interval;
  const progressStep = 100 / steps;

  progressTimer = setInterval(() => {
    progress.value -= progressStep;
    if (progress.value <= 0) {
      progress.value = 0;
      if (progressTimer) clearInterval(progressTimer);
    }
  }, interval);

  timer = setTimeout(() => {
    dismissNotification();
  }, duration);
};

const stopAutoDismiss = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  showProgress.value = false;
};

watch(
  () => props.notification,
  (newNotification) => {
    if (newNotification?.autoDismiss && !newNotification.persistent) {
      startAutoDismiss();
    } else {
      stopAutoDismiss();
    }
  },
  { immediate: true }
);

onMounted(() => {
  // Clean up timers on unmount
  return () => {
    stopAutoDismiss();
  };
});
</script>

<style scoped>
@keyframes slide-in-from-top-5 {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-in {
  animation-name: slide-in-from-top-5;
}

.slide-in-from-top-5 {
  animation-name: slide-in-from-top-5;
}

.duration-300 {
  animation-duration: 300ms;
}
</style>
