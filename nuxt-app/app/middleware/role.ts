import type { UserRole } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware((to) => {
  // Définir les rôles requis selon la route
  const requiredRoles: UserRole[] = [];

  if (to.path.startsWith("/admin")) {
    requiredRoles.push("admin");
  } else if (to.path.startsWith("/doctor")) {
    requiredRoles.push("doctor");
  } else if (to.path.startsWith("/patient")) {
    requiredRoles.push("patient");
  }

  // Si des rôles sont requis et que l'utilisateur n'a pas accès
  setTimeout(() => {
    const { canAccess } = useAuth();
    if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
      // Rediriger vers la page d'accès non autorisé
      return navigateTo("/unauthorized");
    }
  }, 2000); // Délai pour laisser le temps à l'authentification de se faire
});
