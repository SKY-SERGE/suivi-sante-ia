export const useToast = () => {
  const toastStore = useToastStore();

  const showToast = (options: {
    title: string;
    description?: string;
    variant?: "default" | "success" | "error" | "warning" | "destructive";
  }) => {
    const { title, description, variant = "default" } = options;

    switch (variant) {
      case "success":
        toastStore.success(description || "", title);
        break;
      case "error":
      case "destructive":
        toastStore.error(description || "", title);
        break;
      case "warning":
        toastStore.warning(description || "", title);
        break;
      default:
        toastStore.info(description || "", title);
        break;
    }
  };

  return {
    showToast,
    ...toastStore,
  };
};
