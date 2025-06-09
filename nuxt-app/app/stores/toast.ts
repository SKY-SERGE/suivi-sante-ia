import { toast, type ToasterProps } from "vue-sonner";

interface ToastProps extends ToasterProps {
  title: string;
}

export const useToastStore = defineStore("toastStore", {
  state: () => ({
    bus: [] as ToastProps[],
  }),

  getters: {
    getBus: (state) => state.bus,
  },

  actions: {
    addToast(options: ToastProps) {
      (this.bus as ToastProps[]).push(options);
    },

    success(message: string, title: string = "Succès") {
      toast.success(title, {
        description: message,
      });
    },

    error(message: string, title: string = "Une erreur est survenue") {
      toast.error(title, {
        description: message,
      });
    },

    info(message: string, title: string = "Information") {
      toast.info(title, {
        description: message,
      });
    },

    warning(message: string, title: string = "Attention") {
      toast.warning(title, {
        description: message,
      });
    },

    clearBus() {
      this.bus = [];
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot));
}
