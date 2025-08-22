export const getMealTypeName = (type: string) => {
  const types: Record<string, string> = {
    "petit-dejeuner": "Petit-déjeuner",
    dejeuner: "Déjeuner",
    diner: "Dîner",
    collation: "Collation",
  };
  return types[type] || type;
};

export const getMealTypeIcon = (type: string) => {
  const icons: Record<string, { icon: string; color: string }> = {
    "petit-dejeuner": {
      icon: "lucide:coffee",
      color: "bg-orange-100 text-orange-600",
    },
    dejeuner: { icon: "lucide:sun", color: "bg-yellow-100 text-yellow-600" },
    diner: { icon: "lucide:moon", color: "bg-indigo-100 text-indigo-600" },
    collation: { icon: "lucide:apple", color: "bg-green-100 text-green-600" },
  };
  return (
    icons[type] || {
      icon: "lucide:utensils",
      color: "bg-gray-100 text-gray-600",
    }
  );
};

export const getSatisfactionEmoji = (satisfaction: number) => {
  const emojis = ["", "😞", "😐", "🙂", "😊", "😍"];
  return emojis[satisfaction] || "";
};

export const formatMealDateTime = (datetime: string) => {
  const date = new Date(datetime);
  const now = new Date();

  // Si c'est aujourd'hui, ne montrer que l'heure
  if (date.toDateString() === now.toDateString()) {
    return `Aujourd'hui à ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Si c'est hier
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Hier à ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Sinon, date complète
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
