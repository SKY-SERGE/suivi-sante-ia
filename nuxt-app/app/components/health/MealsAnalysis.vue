<template>
  <div class="space-y-6">
    <!-- Période d'analyse -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <h3 class="text-lg font-semibold text-gray-900">
        Analyse de vos habitudes alimentaires
      </h3>
      <select
        v-model="selectedPeriod"
        @change="updateAnalysis"
        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="week">7 derniers jours</option>
        <option value="month">30 derniers jours</option>
        <option value="quarter">3 derniers mois</option>
      </select>
    </div>

    <!-- Statistiques générales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Repas enregistrés</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ analysis.totalMeals }}
            </p>
          </div>
          <Icon name="lucide:utensils" class="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Régularité</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ analysis.regularity }}%
            </p>
          </div>
          <Icon name="lucide:clock" class="h-8 w-8 text-green-500" />
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Variété alimentaire</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ analysis.variety }}
            </p>
          </div>
          <Icon name="lucide:palette" class="h-8 w-8 text-purple-500" />
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Satisfaction moy.</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ analysis.avgSatisfaction }}/5
            </p>
          </div>
          <Icon name="lucide:smile" class="h-8 w-8 text-orange-500" />
        </div>
      </Card>
    </div>

    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Répartition par type de repas -->
      <Card class="p-6">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">
          Répartition par type de repas
        </h4>
        <div class="space-y-3">
          <div
            v-for="(meal, index) in analysis.mealTypeDistribution"
            :key="meal.type"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div
                :class="getMealTypeColor(meal.type)"
                class="w-4 h-4 rounded-full"
              ></div>
              <span class="text-sm font-medium text-gray-700">{{
                getMealTypeName(meal.type)
              }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-20 bg-gray-200 rounded-full h-2">
                <div
                  :class="getMealTypeColor(meal.type)"
                  :style="{ width: `${meal.percentage}%` }"
                  class="h-2 rounded-full transition-all duration-300"
                ></div>
              </div>
              <span class="text-sm text-gray-600 w-12 text-right">{{
                meal.count
              }}</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Horaires des repas -->
      <Card class="p-6">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">
          Horaires habituels
        </h4>
        <div class="space-y-4">
          <div
            v-for="timing in analysis.mealTimings"
            :key="timing.type"
            class="flex items-center justify-between"
          >
            <span class="text-sm font-medium text-gray-700">{{
              getMealTypeName(timing.type)
            }}</span>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">
                {{ timing.avgTime }}
              </div>
              <div class="text-xs text-gray-500">± {{ timing.variance }}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Analyse des tendances -->
    <Card class="p-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">
        Tendances et insights
      </h4>

      <!-- Groupes alimentaires -->
      <div class="mb-6">
        <h5 class="text-md font-medium text-gray-700 mb-3">
          Groupes alimentaires consommés
        </h5>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="group in analysis.foodGroups"
            :key="group.name"
            class="text-center p-3 bg-gray-50 rounded-lg"
          >
            <div class="text-2xl mb-2">{{ group.emoji }}</div>
            <div class="text-sm font-medium text-gray-900">
              {{ group.name }}
            </div>
            <div class="text-xs text-gray-600">{{ group.frequency }}%</div>
          </div>
        </div>
      </div>

      <!-- Points d'amélioration -->
      <div v-if="analysis.improvements.length > 0">
        <h5 class="text-md font-medium text-gray-700 mb-3">
          Points d'amélioration
        </h5>
        <div class="space-y-2">
          <div
            v-for="improvement in analysis.improvements"
            :key="improvement.title"
            class="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <Icon
              name="lucide:alert-triangle"
              class="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0"
            />
            <div>
              <h6 class="text-sm font-medium text-yellow-900">
                {{ improvement.title }}
              </h6>
              <p class="text-sm text-yellow-800">
                {{ improvement.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Points positifs -->
      <div v-if="analysis.strengths.length > 0" class="mt-6">
        <h5 class="text-md font-medium text-gray-700 mb-3">Points positifs</h5>
        <div class="space-y-2">
          <div
            v-for="strength in analysis.strengths"
            :key="strength.title"
            class="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <Icon
              name="lucide:check-circle"
              class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
            />
            <div>
              <h6 class="text-sm font-medium text-green-900">
                {{ strength.title }}
              </h6>
              <p class="text-sm text-green-800">{{ strength.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Action pour demander une nouvelle analyse -->
    <div class="text-center">
      <Button
        @click="requestNewAnalysis"
        :disabled="isAnalyzing"
        class="bg-blue-600 hover:bg-blue-700"
      >
        <Icon
          v-if="isAnalyzing"
          name="lucide:loader-2"
          class="mr-2 h-4 w-4 animate-spin"
        />
        <Icon v-else name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
        {{
          isAnalyzing ? "Analyse en cours..." : "Générer une nouvelle analyse"
        }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MealAnalysis {
  totalMeals: number;
  regularity: number;
  variety: number;
  avgSatisfaction: number;
  mealTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  mealTimings: Array<{
    type: string;
    avgTime: string;
    variance: string;
  }>;
  foodGroups: Array<{
    name: string;
    emoji: string;
    frequency: number;
  }>;
  improvements: Array<{
    title: string;
    description: string;
  }>;
  strengths: Array<{
    title: string;
    description: string;
  }>;
}

interface Props {
  meals: any[];
}

const props = defineProps<Props>();

// État réactif
const selectedPeriod = ref("week");
const isAnalyzing = ref(false);

const analysis = ref<MealAnalysis>({
  totalMeals: 0,
  regularity: 0,
  variety: 0,
  avgSatisfaction: 0,
  mealTypeDistribution: [],
  mealTimings: [],
  foodGroups: [],
  improvements: [],
  strengths: [],
});

// Méthodes
const getMealTypeName = (type: string) => {
  const types: Record<string, string> = {
    "petit-dejeuner": "Petit-déjeuner",
    dejeuner: "Déjeuner",
    diner: "Dîner",
    collation: "Collation",
  };
  return types[type] || type;
};

const getMealTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    "petit-dejeuner": "bg-orange-500",
    dejeuner: "bg-yellow-500",
    diner: "bg-indigo-500",
    collation: "bg-green-500",
  };
  return colors[type] || "bg-gray-500";
};

const calculateAnalysis = () => {
  // Filtrer les repas selon la période sélectionnée
  const now = new Date();
  let startDate: Date;

  switch (selectedPeriod.value) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "quarter":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const filteredMeals = props.meals.filter(
    (meal) => new Date(meal.datetime) >= startDate
  );

  // Calculer les statistiques
  analysis.value = {
    totalMeals: filteredMeals.length,
    regularity: calculateRegularity(filteredMeals),
    variety: calculateVariety(filteredMeals),
    avgSatisfaction: calculateAvgSatisfaction(filteredMeals),
    mealTypeDistribution: calculateMealTypeDistribution(filteredMeals),
    mealTimings: calculateMealTimings(filteredMeals),
    foodGroups: calculateFoodGroups(filteredMeals),
    improvements: generateImprovements(filteredMeals),
    strengths: generateStrengths(filteredMeals),
  };
};

const calculateRegularity = (meals: any[]) => {
  // Logique simplifiée pour calculer la régularité
  if (meals.length === 0) return 0;

  const daysWithMeals = new Set(
    meals.map((meal) => new Date(meal.datetime).toDateString())
  ).size;

  const totalDays = Math.min(
    selectedPeriod.value === "week" ? 7 : 30,
    meals.length
  );
  return Math.round((daysWithMeals / totalDays) * 100);
};

const calculateVariety = (meals: any[]) => {
  if (meals.length === 0) return 0;

  const uniqueFoods = new Set();
  meals.forEach((meal) => {
    meal.foods?.forEach((food: any) => {
      uniqueFoods.add(food.name.toLowerCase());
    });
  });

  return uniqueFoods.size;
};

const calculateAvgSatisfaction = (meals: any[]) => {
  const mealsWithSatisfaction = meals.filter((meal) => meal.satisfaction);
  if (mealsWithSatisfaction.length === 0) return 0;

  const total = mealsWithSatisfaction.reduce(
    (sum, meal) => sum + meal.satisfaction,
    0
  );
  return Math.round((total / mealsWithSatisfaction.length) * 10) / 10;
};

const calculateMealTypeDistribution = (meals: any[]) => {
  const distribution: Record<string, number> = {};

  meals.forEach((meal) => {
    distribution[meal.type] = (distribution[meal.type] || 0) + 1;
  });

  const total = meals.length || 1;

  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / total) * 100),
  }));
};

const calculateMealTimings = (meals: any[]) => {
  const timingsByType: Record<string, string[]> = {};

  meals.forEach((meal) => {
    const time = new Date(meal.datetime).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!timingsByType[meal.type]) {
      timingsByType[meal.type] = [];
    }
    timingsByType[meal.type].push(time);
  });

  return Object.entries(timingsByType).map(([type, times]) => ({
    type,
    avgTime: times[Math.floor(times.length / 2)] || "00:00",
    variance: "±30min", // Simplification
  }));
};

const calculateFoodGroups = (meals: any[]) => {
  // Exemple de groupes alimentaires avec émojis
  const groups = [
    { name: "Fruits", emoji: "🍎", frequency: 25 },
    { name: "Légumes", emoji: "🥬", frequency: 30 },
    { name: "Céréales", emoji: "🌾", frequency: 40 },
    { name: "Protéines", emoji: "🥩", frequency: 35 },
  ];

  return groups;
};

const generateImprovements = (meals: any[]) => {
  const improvements = [];

  if (meals.length < 7) {
    improvements.push({
      title: "Enregistrement incomplet",
      description:
        "Essayez d'enregistrer plus régulièrement vos repas pour une meilleure analyse.",
    });
  }

  if (calculateAvgSatisfaction(meals) < 3) {
    improvements.push({
      title: "Satisfaction faible",
      description:
        "Vos repas semblent peu satisfaisants. Considérez varier vos plats.",
    });
  }

  return improvements;
};

const generateStrengths = (meals: any[]) => {
  const strengths = [];

  if (calculateRegularity(meals) > 80) {
    strengths.push({
      title: "Excellente régularité",
      description:
        "Vous enregistrez vos repas de manière très régulière, continuez !",
    });
  }

  if (calculateAvgSatisfaction(meals) >= 4) {
    strengths.push({
      title: "Satisfaction élevée",
      description: "Vos repas vous satisfont globalement, c'est excellent !",
    });
  }

  return strengths;
};

const updateAnalysis = () => {
  calculateAnalysis();
};

const requestNewAnalysis = async () => {
  isAnalyzing.value = true;
  try {
    // Simulation d'appel API pour une nouvelle analyse IA
    await new Promise((resolve) => setTimeout(resolve, 2000));
    calculateAnalysis();
  } catch (error) {
    console.error("Erreur lors de la nouvelle analyse:", error);
  } finally {
    isAnalyzing.value = false;
  }
};

// Lifecycle
onMounted(() => {
  calculateAnalysis();
});

// Watcher pour recalculer quand les repas changent
watch(
  () => props.meals,
  () => {
    calculateAnalysis();
  },
  { deep: true }
);
</script>
