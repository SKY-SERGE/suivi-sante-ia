export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth();

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated.value) {
    return navigateTo("/auth/login");
  }
});
