export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, redirectToDashboard } = useAuth();

  // Si l'utilisateur est déjà authentifié et tente d'accéder aux pages d'auth
  if (isAuthenticated.value && to.path.startsWith("/auth")) {
    // Utiliser la logique de redirection basée sur le rôle
    await redirectToDashboard();
    return;
  }
});
