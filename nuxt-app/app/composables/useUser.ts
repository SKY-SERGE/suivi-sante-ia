import type { User } from "@supabase/supabase-js";

export const useUser = () => {
  const user = useSupabaseUser();
  const { userProfile, userRole } = useUserProfile();

  const firstName = computed(() => {
    return (
      userProfile.value?.first_name || user.value?.user_metadata?.first_name
    );
  });

  const lastName = computed(() => {
    return userProfile.value?.last_name || user.value?.user_metadata?.last_name;
  });

  const setUser = (newUser: User | null) => {
    if (newUser) {
      user.value = newUser;
    } else {
      user.value = null;
    }
  };

  return {
    user: readonly(computed(() => user)),
    isAuthenticated: readonly(computed(() => !!user.value)),
    userProfile: readonly(computed(() => userProfile)),
    userRole: readonly(computed(() => userRole)),
    firstName: readonly(firstName),
    lastName: readonly(lastName),

    // Computed properties
    userId: computed(() => user.value?.id || null),
    userEmail: computed(() => user.value?.email || ""),
    userFullName: computed(() => {
      return `${firstName.value || ""} ${lastName.value || ""}`.trim();
    }),

    // Methods
    setUser,
  };
};
