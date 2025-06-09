export const getRoleIcon = (role?: string) => {
  switch (role) {
    case "patient":
      return "lucide:user";
    case "doctor":
      return "lucide:stethoscope";
    case "admin":
      return "lucide:shield";
    default:
      return "lucide:user";
  }
};

export const getRoleLabel = (role?: string) => {
  switch (role) {
    case "patient":
      return "Patient";
    case "doctor":
      return "Médecin";
    case "admin":
      return "Administrateur";
    default:
      return "Utilisateur";
  }
};

export const getRoleDescription = (role?: string) => {
  switch (role) {
    case "patient":
      return "Suivez votre santé, définissez des objectifs et analysez vos habitudes avec l'IA.";
    case "doctor":
      return "Gérez vos patients, consultez leurs données et communiquez de manière sécurisée.";
    case "admin":
      return "Administrez la plateforme, gérez les utilisateurs et surveillez la sécurité.";
    default:
      return "Bienvenue sur la plateforme.";
  }
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
