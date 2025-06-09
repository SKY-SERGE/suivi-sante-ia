import type { UserRole } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware((to) => {
  const { canAccess } = useAuth();

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
  if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
    // Rediriger vers la page d'accès non autorisé
    return navigateTo("/unauthorized");
  }
});
