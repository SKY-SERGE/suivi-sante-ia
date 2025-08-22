<template>
    <Card class="p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <!-- En-tête du repas -->
                <div class="flex items-center space-x-3 mb-3">
                    <div class="flex items-center space-x-2">
                        <div :class="getMealTypeIcon(meal.type).color" class="p-2 rounded-lg">
                            <Icon :name="getMealTypeIcon(meal.type).icon" class="h-4 w-4" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900">
                                {{ getMealTypeName(meal.type) }}
                            </h3>
                            <p class="text-sm text-gray-600">
                                {{ formatMealDateTime(meal.datetime) }}
                            </p>
                        </div>
                    </div>

                    <!-- Badge photo -->
                    <div v-if="meal.photo_url"
                        class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Icon name="lucide:camera" class="h-3 w-3 inline mr-1" />
                        Photo analysée
                    </div>
                </div>

                <!-- Aliments -->
                <div class="mb-3">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">
                        Aliments consommés :
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="food in meal.foods" :key="food.name"
                            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ food.name }}
                            <span v-if="food.quantity" class="ml-1 text-blue-600">
                                ({{ food.quantity }}{{ food.unit }})
                            </span>
                        </span>
                    </div>
                </div>

                <!-- Satisfaction et faim -->
                <div v-if="meal.satisfaction || meal.hunger_level" class="flex items-center space-x-4 mb-3">
                    <div v-if="meal.satisfaction" class="flex items-center space-x-1">
                        <span class="text-sm text-gray-600">Satisfaction :</span>
                        <span class="text-sm">{{
                            getSatisfactionEmoji(meal.satisfaction)
                        }}</span>
                    </div>
                    <div v-if="meal.hunger_level" class="flex items-center space-x-1">
                        <span class="text-sm text-gray-600">Faim :</span>
                        <span class="text-sm font-medium">{{ meal.hunger_level }}/5</span>
                    </div>
                </div>

                <!-- Notes -->
                <div v-if="meal.notes" class="mb-3">
                    <p class="text-sm text-gray-700 italic">{{ meal.notes }}</p>
                </div>

                <!-- Analyse IA -->
                <div v-if="meal.ai_analysis" class="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 class="text-sm font-medium text-green-800 mb-2 flex items-center">
                        <Icon name="lucide:brain" class="h-4 w-4 mr-2" />
                        Analyse IA
                    </h4>
                    <p class="text-sm text-green-700">{{ meal.ai_analysis }}</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2 ml-4">
                <Button @click="onEdit(meal)" variant="outline" size="sm" class="text-gray-600 hover:text-gray-900">
                    <Icon name="lucide:edit-2" class="h-4 w-4" />
                </Button>
                <Button @click="onEdit(meal)" variant="outline" size="sm" class="text-gray-600 hover:text-gray-900">
                    <Icon name="lucide:edit-2" class="h-4 w-4" />
                </Button>
                <Button @click="confirmDelete(meal)" variant="outline" size="sm"
                    class="text-red-600 hover:text-red-900 border-red-300 hover:bg-red-50">
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                </Button>
            </div>
        </div>
    </Card>
</template>

<script setup lang="ts">
import type { MealData } from '~/types/models';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const props = defineProps<{
    meal: MealData;
}>();

// composables
const { showToast } = useToast();
const {
    updateMeal,
    deleteMeal,
} = useMeals();

// Méthodes
const onEdit = async (meal: MealData) => {
    try {
        const { error: updateError } = await updateMeal(meal.id, []);
        if (updateError) {
            showToast({
                title: "Erreur lors de la mise à jour",
                variant: "error",
            });
            return;
        }

        showToast({
            title: "Repas mis à jour avec succès",
            variant: "success",
        });

        emit("edited", meal);
    } catch (error) {
        console.error("Erreur lors de l'édition:", error);
    }
};

const confirmDelete = async (meal: Meal) => {
    if (
        confirm(
            `Êtes-vous sûr de vouloir supprimer ce repas (${getMealTypeName(
                meal.type
            )}) ?`
        )
    ) {

        try {
            const { error: deleteError } = await deleteMeal(meal.id);

            if (deleteError) {
                showToast({
                    title: "Erreur lors de la suppression",
                    variant: "error",
                });
                return;
            }

            showToast({
                title: "Repas supprimé avec succès",
                variant: "success",
            });

            emit("deleted", meal.id);
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            showToast({
                title: "Erreur lors de la suppression",
                variant: "error",
            });
        }
    }
};
</script>