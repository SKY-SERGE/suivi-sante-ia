// Données de test pour les utilisateurs
export const testUsers = {
  patient: {
    id: "test-patient-1",
    email: "patient@test.com",
    role: "patient",
    profile: {
      firstName: "Jean",
      lastName: "Dupont",
      dateOfBirth: "1990-01-01",
      phone: "0123456789",
    },
  },

  doctor: {
    id: "test-doctor-1",
    email: "docteur@test.com",
    role: "doctor",
    profile: {
      firstName: "Dr. Marie",
      lastName: "Martin",
      speciality: "Médecine générale",
      licenseNumber: "MD123456",
    },
  },

  admin: {
    id: "test-admin-1",
    email: "admin@test.com",
    role: "admin",
    profile: {
      firstName: "Admin",
      lastName: "Système",
    },
  },
};

// Données de test pour les données de santé
export const testHealthData = {
  mood: [
    { date: "2024-01-01", value: 7, notes: "Bonne humeur" },
    { date: "2024-01-02", value: 6, notes: "Fatigue légère" },
    { date: "2024-01-03", value: 8, notes: "Excellente journée" },
  ],

  sleep: [
    { date: "2024-01-01", hours: 8, quality: "good" },
    { date: "2024-01-02", hours: 6, quality: "poor" },
    { date: "2024-01-03", hours: 7.5, quality: "excellent" },
  ],

  activity: [
    { date: "2024-01-01", steps: 8000, duration: 45, type: "walking" },
    { date: "2024-01-02", steps: 12000, duration: 60, type: "running" },
    { date: "2024-01-03", steps: 6000, duration: 30, type: "cycling" },
  ],
};

// Données de test pour les objectifs
export const testGoals = [
  {
    id: "goal-1",
    title: "Boire 2L d'eau par jour",
    description: "Maintenir une bonne hydratation",
    targetValue: 2000,
    unit: "ml",
    frequency: "daily",
    status: "active",
  },
  {
    id: "goal-2",
    title: "Marcher 10000 pas par jour",
    description: "Activité physique régulière",
    targetValue: 10000,
    unit: "steps",
    frequency: "daily",
    status: "active",
  },
  {
    id: "goal-3",
    title: "Dormir 8h par nuit",
    description: "Sommeil réparateur",
    targetValue: 8,
    unit: "hours",
    frequency: "daily",
    status: "completed",
  },
];

// Données de test pour les repas
export const testMeals = [
  {
    id: "meal-1",
    date: "2024-01-01",
    type: "breakfast",
    foods: ["croissant", "café", "orange"],
    photo: "/uploads/breakfast-1.jpg",
    analysis: {
      calories: 350,
      categories: ["céréales", "fruits", "boissons"],
      recommendations: "Repas équilibré, pensez à ajouter des protéines",
    },
  },
  {
    id: "meal-2",
    date: "2024-01-01",
    type: "lunch",
    foods: ["salade", "poulet", "riz"],
    photo: "/uploads/lunch-1.jpg",
    analysis: {
      calories: 450,
      categories: ["légumes", "protéines", "céréales"],
      recommendations: "Excellent équilibre nutritionnel",
    },
  },
];

// Données de test pour les messages
export const testMessages = [
  {
    id: "msg-1",
    senderId: "test-patient-1",
    receiverId: "test-doctor-1",
    content:
      "Bonjour docteur, j'ai une question concernant mes derniers résultats",
    timestamp: "2024-01-01T10:00:00Z",
    read: false,
  },
  {
    id: "msg-2",
    senderId: "test-doctor-1",
    receiverId: "test-patient-1",
    content:
      "Bonjour, je vais examiner vos résultats et vous répondre rapidement",
    timestamp: "2024-01-01T10:30:00Z",
    read: true,
  },
];

// Données de test pour les consentements
export const testConsents = [
  {
    id: "consent-1",
    patientId: "test-patient-1",
    doctorId: "test-doctor-1",
    status: "granted",
    grantedAt: "2024-01-01T00:00:00Z",
    expiresAt: "2025-01-01T00:00:00Z",
  },
];
