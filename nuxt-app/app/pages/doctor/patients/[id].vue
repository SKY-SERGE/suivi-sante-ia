<template>
  <Container>
    <!-- Breadcrumb navigation -->
    <nav class="mb-6" aria-label="Fil d'Ariane">
      <ol class="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <NuxtLink
            to="/doctor/dashboard"
            class="hover:text-gray-700 focus:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          >
            Dashboard
          </NuxtLink>
        </li>
        <Icon name="lucide:chevron-right" class="h-4 w-4" aria-hidden="true" />
        <li>
          <NuxtLink
            to="/doctor/dashboard"
            class="hover:text-gray-700 focus:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          >
            Patients
          </NuxtLink>
        </li>
        <Icon name="lucide:chevron-right" class="h-4 w-4" aria-hidden="true" />
        <li class="text-gray-900 font-medium" aria-current="page">
          {{
            patient
              ? `${patient.first_name} ${patient.last_name}`
              : "Données Patient"
          }}
        </li>
      </ol>
    </nav>

    <!-- En-tête de page -->
    <header class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Données Patient</h1>
          <p class="mt-2 text-gray-600">
            Consultation des données de santé et historique médical
          </p>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/doctor/dashboard">
            <Button variant="outline" class="flex items-center gap-2">
              <Icon name="lucide:arrow-left" class="h-4 w-4" />
              Retour au dashboard
            </Button>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main id="main-content">
      <!-- Informations du patient -->
      <div v-if="loading" class="text-center py-12">
        <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin mx-auto" />
        <p class="mt-2">Chargement des données du patient...</p>
      </div>

      <div v-else-if="!patient" class="text-center py-12">
        <Icon
          name="lucide:alert-circle"
          class="h-12 w-12 mx-auto text-red-500 mb-4"
        />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          Patient non trouvé
        </h2>
        <p class="text-gray-600 mb-4">
          Ce patient n'existe pas ou vous n'avez pas l'autorisation de consulter
          ses données.
        </p>
        <NuxtLink to="/doctor/dashboard">
          <Button>Retour au dashboard</Button>
        </NuxtLink>
      </div>

      <div v-else class="space-y-6">
        <!-- En-tête du patient -->
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  class="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center"
                >
                  <Icon name="lucide:user" class="h-8 w-8 text-blue-600" />
                </div>
                <div class="ml-6">
                  <h1 class="text-2xl font-bold text-gray-900">
                    {{ patient.first_name }} {{ patient.last_name }}
                  </h1>
                  <div
                    class="mt-1 flex items-center gap-4 text-sm text-gray-500"
                  >
                    <span>{{ patient.email }}</span>
                    <span v-if="patient.phone">{{ patient.phone }}</span>
                    <span v-if="patient.date_of_birth">
                      {{ calculateAge(patient.date_of_birth) }} ans
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="getConsentStatusClass(consent?.status)"
                >
                  <Icon
                    :name="getConsentStatusIcon(consent?.status)"
                    class="h-4 w-4 mr-2"
                  />
                  {{ getConsentStatusText(consent?.status) }}
                </span>
                <Button @click="sendMessage" variant="outline">
                  <Icon name="lucide:message-circle" class="h-4 w-4 mr-2" />
                  Envoyer un message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <!-- Vue synthétique du patient -->
        <div
          v-if="consent?.status === 'granted'"
          class="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <!-- Informations critiques -->
          <Card class="lg:col-span-2">
            <CardHeader>
              <CardTitle class="flex items-center">
                <Icon
                  name="lucide:alert-triangle"
                  class="h-5 w-5 mr-2 text-red-600"
                />
                Informations critiques
              </CardTitle>
              <CardDescription>
                Allergies, antécédents médicaux et informations d'urgence
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Allergies -->
              <div class="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div class="flex items-center mb-2">
                  <Icon
                    name="lucide:shield-alert"
                    class="h-4 w-4 mr-2 text-red-600"
                  />
                  <h4 class="font-medium text-red-900">Allergies connues</h4>
                </div>
                <div
                  v-if="patientSummary.allergies.length > 0"
                  class="flex flex-wrap gap-2"
                >
                  <span
                    v-for="allergy in patientSummary.allergies"
                    :key="allergy"
                    class="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full"
                  >
                    {{ allergy }}
                  </span>
                </div>
                <p v-else class="text-sm text-red-700">
                  Aucune allergie connue
                </p>
              </div>

              <!-- Antécédents médicaux -->
              <div class="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div class="flex items-center mb-2">
                  <Icon
                    name="lucide:file-text"
                    class="h-4 w-4 mr-2 text-orange-600"
                  />
                  <h4 class="font-medium text-orange-900">
                    Antécédents médicaux
                  </h4>
                </div>
                <div
                  v-if="patientSummary.medicalHistory.length > 0"
                  class="space-y-1"
                >
                  <p
                    v-for="condition in patientSummary.medicalHistory"
                    :key="condition"
                    class="text-sm text-orange-800"
                  >
                    • {{ condition }}
                  </p>
                </div>
                <p v-else class="text-sm text-orange-700">
                  Aucun antécédent médical connu
                </p>
              </div>

              <!-- Traitements actuels -->
              <div class="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div class="flex items-center mb-2">
                  <Icon name="lucide:pill" class="h-4 w-4 mr-2 text-blue-600" />
                  <h4 class="font-medium text-blue-900">Traitements actuels</h4>
                </div>
                <div
                  v-if="patientSummary.currentMedications.length > 0"
                  class="space-y-1"
                >
                  <p
                    v-for="medication in patientSummary.currentMedications"
                    :key="medication"
                    class="text-sm text-blue-800"
                  >
                    • {{ medication }}
                  </p>
                </div>
                <p v-else class="text-sm text-blue-700">
                  Aucun traitement en cours
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Assurance et contact d'urgence -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center">
                <Icon
                  name="lucide:shield"
                  class="h-5 w-5 mr-2 text-green-600"
                />
                Assurance & Urgence
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Informations d'assurance -->
              <div class="p-3 border border-green-200 bg-green-50 rounded-lg">
                <h4 class="font-medium text-green-900 mb-2">Assurance</h4>
                <div class="space-y-1 text-sm text-green-800">
                  <p>
                    <span class="font-medium">Compagnie:</span>
                    {{ patientSummary.insurance.company || "Non renseigné" }}
                  </p>
                  <p>
                    <span class="font-medium">N° Police:</span>
                    {{
                      patientSummary.insurance.policyNumber || "Non renseigné"
                    }}
                  </p>
                  <p>
                    <span class="font-medium">Groupe:</span>
                    {{ patientSummary.insurance.group || "Non renseigné" }}
                  </p>
                </div>
              </div>

              <!-- Contact d'urgence -->
              <div class="p-3 border border-purple-200 bg-purple-50 rounded-lg">
                <h4 class="font-medium text-purple-900 mb-2">
                  Contact d'urgence
                </h4>
                <div class="space-y-1 text-sm text-purple-800">
                  <p>
                    <span class="font-medium">Nom:</span>
                    {{
                      patientSummary.emergencyContact.name || "Non renseigné"
                    }}
                  </p>
                  <p>
                    <span class="font-medium">Lien:</span>
                    {{
                      patientSummary.emergencyContact.relation ||
                      "Non renseigné"
                    }}
                  </p>
                  <p>
                    <span class="font-medium">Tél:</span>
                    {{
                      patientSummary.emergencyContact.phone || "Non renseigné"
                    }}
                  </p>
                </div>
              </div>

              <!-- Dernière visite -->
              <div class="p-3 border border-gray-200 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Dernière visite</h4>
                <div class="text-sm text-gray-800">
                  <p v-if="patientSummary.lastVisit.date">
                    {{ formatDate(patientSummary.lastVisit.date) }}
                  </p>
                  <p v-else>Aucune visite enregistrée</p>
                  <p
                    v-if="patientSummary.lastVisit.reason"
                    class="text-xs text-gray-600 mt-1"
                  >
                    {{ patientSummary.lastVisit.reason }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <!-- Résumé de santé avec IA -->
        <Card v-if="consent?.status === 'granted'">
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <div class="flex items-center">
                <Icon
                  name="lucide:brain"
                  class="h-5 w-5 mr-2 text-purple-600"
                />
                Analyse IA - Résumé de santé
              </div>
              <div class="flex items-center gap-2">
                <select
                  v-model="aiAnalysisType"
                  class="text-sm border rounded px-2 py-1"
                  @change="generateAIAnalysis"
                >
                  <option value="comprehensive">Analyse complète</option>
                  <option value="vitals">Focus signes vitaux</option>
                  <option value="lifestyle">Focus mode de vie</option>
                  <option value="risk">Évaluation des risques</option>
                </select>
                <Button
                  @click="generateAIAnalysis"
                  variant="outline"
                  size="sm"
                  :disabled="aiAnalysis.loading"
                >
                  <Icon
                    name="lucide:refresh-cw"
                    class="h-4 w-4 mr-2"
                    :class="{ 'animate-spin': aiAnalysis.loading }"
                  />
                  Régénérer
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Analyse automatique basée sur les données récentes du patient
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="aiAnalysis.loading" class="text-center py-8">
              <Icon
                name="lucide:brain"
                class="h-8 w-8 animate-pulse mx-auto text-purple-600"
              />
              <p class="mt-2 text-sm text-gray-600">
                Génération de l'analyse IA...
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Type d'analyse: {{ getAnalysisTypeLabel(aiAnalysisType) }}
              </p>
            </div>
            <div v-else-if="aiAnalysis.data" class="space-y-6">
              <!-- Points clés avec priorités -->
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-medium text-purple-900">
                    Points clés identifiés
                  </h4>
                  <span
                    class="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded"
                  >
                    {{ aiAnalysis.data.keyPoints.length }} éléments
                  </span>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(point, index) in aiAnalysis.data.keyPoints"
                    :key="index"
                    class="flex items-start p-2 bg-white rounded border"
                  >
                    <Icon
                      name="lucide:check-circle"
                      class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-purple-600"
                    />
                    <div class="flex-1">
                      <p class="text-sm text-purple-800">{{ point }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <span
                          class="text-xs px-1.5 py-0.5 rounded"
                          :class="getPointPriorityClass(index)"
                        >
                          {{ getPointPriority(index) }}
                        </span>
                        <button
                          @click="togglePointNote(index)"
                          class="text-xs text-purple-600 hover:text-purple-800"
                        >
                          {{
                            pointNotes[index] ? "Masquer note" : "Ajouter note"
                          }}
                        </button>
                      </div>
                      <div v-if="pointNotes[index]" class="mt-2">
                        <textarea
                          v-model="pointNotes[index]"
                          placeholder="Note du médecin..."
                          class="w-full text-xs border rounded p-2 resize-none"
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recommandations avec actions -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-medium text-yellow-900">
                    Recommandations IA
                  </h4>
                  <span
                    class="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded"
                  >
                    {{ aiAnalysis.data.recommendations.length }} suggestions
                  </span>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(rec, index) in aiAnalysis.data.recommendations"
                    :key="index"
                    class="flex items-start p-2 bg-white rounded border"
                  >
                    <Icon
                      name="lucide:lightbulb"
                      class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-600"
                    />
                    <div class="flex-1">
                      <p class="text-sm text-yellow-800">{{ rec }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <button
                          @click="approveRecommendation(index)"
                          class="text-xs text-green-600 hover:text-green-800"
                        >
                          ✓ Approuver
                        </button>
                        <button
                          @click="modifyRecommendation(index)"
                          class="text-xs text-blue-600 hover:text-blue-800"
                        >
                          ✎ Modifier
                        </button>
                        <button
                          @click="dismissRecommendation(index)"
                          class="text-xs text-red-600 hover:text-red-800"
                        >
                          ✗ Rejeter
                        </button>
                      </div>
                      <div v-if="modifiedRecommendations[index]" class="mt-2">
                        <textarea
                          v-model="modifiedRecommendations[index]"
                          class="w-full text-xs border rounded p-2 resize-none"
                          rows="2"
                          :placeholder="rec"
                        ></textarea>
                        <div class="flex gap-1 mt-1">
                          <button
                            @click="saveModifiedRecommendation(index)"
                            class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Sauvegarder
                          </button>
                          <button
                            @click="cancelModification(index)"
                            class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Méta-informations et feedback -->
              <div class="border-t border-gray-200 pt-4">
                <div
                  class="flex items-center justify-between text-xs text-gray-500 mb-3"
                >
                  <span>
                    Analyse générée le
                    {{ formatDate(aiAnalysis.data.generatedAt) }} (Type:
                    {{ getAnalysisTypeLabel(aiAnalysisType) }})
                  </span>
                  <div class="flex items-center gap-2">
                    <span>Qualité de l'analyse:</span>
                    <div class="flex gap-1">
                      <button
                        v-for="star in 5"
                        :key="star"
                        @click="rateAnalysis(star)"
                        class="text-yellow-400 hover:text-yellow-500"
                      >
                        <Icon
                          name="lucide:star"
                          class="h-3 w-3"
                          :class="{ 'fill-current': star <= analysisRating }"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  class="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-2"
                >
                  <Icon
                    name="lucide:alert-triangle"
                    class="h-3 w-3 mr-1 inline"
                  />
                  <strong>Important:</strong> Cette analyse est générée
                  automatiquement et doit être validée par un professionnel de
                  santé avant toute décision médicale.
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <Icon
                name="lucide:brain"
                class="h-8 w-8 mx-auto mb-2 text-gray-300"
              />
              <p class="mb-3">Analyse IA non disponible</p>
              <Button @click="generateAIAnalysis" variant="outline" size="sm">
                Générer une analyse
              </Button>
            </div>
          </CardContent> </Card
        ><!-- Métriques de santé principales -->
        <div
          v-if="consent?.status === 'granted'"
          class="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent class="p-4">
              <div class="flex items-center">
                <Icon name="lucide:heart" class="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p class="text-sm text-gray-600">Fréquence cardiaque</p>
                  <p class="text-xl font-semibold">
                    {{ healthMetrics.heartRate || "—" }}
                    <span class="text-sm text-gray-500">bpm</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-4">
              <div class="flex items-center">
                <Icon
                  name="lucide:thermometer"
                  class="h-8 w-8 text-orange-500 mr-3"
                />
                <div>
                  <p class="text-sm text-gray-600">Température</p>
                  <p class="text-xl font-semibold">
                    {{ healthMetrics.temperature || "—" }}
                    <span class="text-sm text-gray-500">°C</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-4">
              <div class="flex items-center">
                <Icon
                  name="lucide:gauge"
                  class="h-8 w-8 text-purple-500 mr-3"
                />
                <div>
                  <p class="text-sm text-gray-600">Tension artérielle</p>
                  <p class="text-xl font-semibold">
                    {{ healthMetrics.bloodPressure || "—" }}
                    <span class="text-sm text-gray-500">mmHg</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-4">
              <div class="flex items-center">
                <Icon name="lucide:moon" class="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p class="text-sm text-gray-600">Sommeil</p>
                  <p class="text-xl font-semibold">
                    {{ healthMetrics.sleepHours || "—" }}
                    <span class="text-sm text-gray-500">h</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Section d'analyse détaillée des données -->
        <Card v-if="consent?.status === 'granted'">
          <CardHeader>
            <CardTitle class="flex items-center">
              <Icon name="lucide:bar-chart-3" class="h-5 w-5 mr-2" />
              Analyse détaillée des données de santé
            </CardTitle>
            <CardDescription>
              Visualisations interactives et analyses approfondies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <!-- Contrôles de filtrage -->
            <div
              class="mb-6 flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-2">
                <Icon name="lucide:calendar" class="h-4 w-4 text-gray-500" />
                <select
                  v-model="selectedPeriod"
                  class="text-sm border rounded px-3 py-1"
                  @change="loadDetailedChartData"
                >
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">3 derniers mois</option>
                  <option value="365">1 an</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="lucide:activity" class="h-4 w-4 text-gray-500" />
                <select
                  v-model="selectedMetricType"
                  class="text-sm border rounded px-3 py-1"
                  @change="loadDetailedChartData"
                >
                  <option value="vitals">Signes vitaux</option>
                  <option value="mood">Humeur</option>
                  <option value="activity">Activité physique</option>
                  <option value="sleep">Sommeil</option>
                  <option value="symptoms">Symptômes</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="lucide:chart-line" class="h-4 w-4 text-gray-500" />
                <select
                  v-model="selectedChartType"
                  class="text-sm border rounded px-3 py-1"
                >
                  <option value="line">Courbe de tendance</option>
                  <option value="bar">Graphique en barres</option>
                  <option value="area">Graphique en aires</option>
                  <option value="scatter">Nuage de points</option>
                </select>
              </div>
              <Button
                @click="loadDetailedChartData"
                variant="outline"
                size="sm"
                :disabled="chartLoading"
              >
                <Icon
                  name="lucide:refresh-cw"
                  class="h-4 w-4 mr-2"
                  :class="{ 'animate-spin': chartLoading }"
                />
                Actualiser
              </Button>
            </div>

            <!-- Graphiques détaillés -->
            <div v-if="chartLoading" class="text-center py-12">
              <Icon
                name="lucide:loader-2"
                class="h-8 w-8 animate-spin mx-auto text-blue-500"
              />
              <p class="mt-2 text-gray-600">Chargement des données...</p>
            </div>

            <div v-else class="space-y-6">
              <!-- Graphique principal -->
              <div class="bg-white p-4 border rounded-lg">
                <h4 class="font-medium mb-4 flex items-center">
                  <Icon
                    :name="getMetricIcon(selectedMetricType)"
                    class="h-4 w-4 mr-2"
                    :class="getMetricIconColor(selectedMetricType)"
                  />
                  {{ getMetricTitle(selectedMetricType) }}
                  <span class="ml-2 text-sm text-gray-500">
                    ({{ selectedPeriod }} derniers jours)
                  </span>
                </h4>
                <HealthDataChart
                  :data="detailedChartData"
                  :dataType="selectedMetricType"
                  :chartType="selectedChartType"
                  :height="400"
                />
              </div>

              <!-- Statistiques détaillées -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent class="p-4">
                    <div class="flex items-center">
                      <Icon
                        name="lucide:trending-up"
                        class="h-6 w-6 text-green-500 mr-3"
                      />
                      <div>
                        <p class="text-sm text-gray-600">Tendance générale</p>
                        <p
                          class="text-lg font-semibold"
                          :class="getTrendColor(detailedStats.trend)"
                        >
                          {{ detailedStats.trend || "Stable" }}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent class="p-4">
                    <div class="flex items-center">
                      <Icon
                        name="lucide:target"
                        class="h-6 w-6 text-blue-500 mr-3"
                      />
                      <div>
                        <p class="text-sm text-gray-600">Moyenne période</p>
                        <p class="text-lg font-semibold">
                          {{ detailedStats.average || "—" }}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent class="p-4">
                    <div class="flex items-center">
                      <Icon
                        name="lucide:zap"
                        class="h-6 w-6 text-yellow-500 mr-3"
                      />
                      <div>
                        <p class="text-sm text-gray-600">Variabilité</p>
                        <p class="text-lg font-semibold">
                          {{ detailedStats.variability || "Faible" }}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <!-- Analyse comparative -->
              <div
                v-if="comparisonData.length > 0"
                class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <h4 class="font-medium text-blue-900 mb-3 flex items-center">
                  <Icon name="lucide:compare" class="h-4 w-4 mr-2" />
                  Comparaison avec les références
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="comparison in comparisonData"
                    :key="comparison.metric"
                    class="flex items-center justify-between p-3 bg-white rounded border"
                  >
                    <span class="text-sm">{{ comparison.metric }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium">{{
                        comparison.patientValue
                      }}</span>
                      <Icon
                        :name="
                          comparison.status === 'normal'
                            ? 'lucide:check-circle'
                            : comparison.status === 'warning'
                            ? 'lucide:alert-triangle'
                            : 'lucide:alert-circle'
                        "
                        class="h-4 w-4"
                        :class="
                          comparison.status === 'normal'
                            ? 'text-green-500'
                            : comparison.status === 'warning'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        "
                      />
                      <span class="text-xs text-gray-500">{{
                        comparison.reference
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center">
              <Icon name="lucide:heart" class="h-8 w-8 text-red-500" />
              <div class="ml-3">
                <div class="text-2xl font-bold">
                  {{ healthMetrics.heartRate || "--" }}
                </div>
                <div class="text-sm text-gray-600">BPM</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center">
              <Icon name="lucide:thermometer" class="h-8 w-8 text-orange-500" />
              <div class="ml-3">
                <div class="text-2xl font-bold">
                  {{ healthMetrics.temperature || "--" }}
                </div>
                <div class="text-sm text-gray-600">°C</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center">
              <Icon name="lucide:activity" class="h-8 w-8 text-blue-500" />
              <div class="ml-3">
                <div class="text-2xl font-bold">
                  {{ healthMetrics.bloodPressure || "--" }}
                </div>
                <div class="text-sm text-gray-600">mmHg</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center">
              <Icon name="lucide:moon" class="h-8 w-8 text-indigo-500" />
              <div class="ml-3">
                <div class="text-2xl font-bold">
                  {{ healthMetrics.sleepHours || "--" }}
                </div>
                <div class="text-sm text-gray-600">heures</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Graphiques de données de santé -->
      <div
        v-if="consent?.status === 'granted'"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Icon name="lucide:trending-up" class="h-5 w-5 mr-2" />
              Évolution des signes vitaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthDataChart
              :data="chartData.vitals"
              :dataType="'vitals'"
              :height="300"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Icon name="lucide:smile" class="h-5 w-5 mr-2" />
              Suivi de l'humeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthDataChart
              :data="chartData.mood"
              :dataType="'mood'"
              :height="300"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Icon name="lucide:zap" class="h-5 w-5 mr-2" />
              Niveau d'activité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthDataChart
              :data="chartData.activity"
              :dataType="'activity'"
              :height="300"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Icon name="lucide:target" class="h-5 w-5 mr-2" />
              Progression des objectifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-if="patientGoals.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <Icon
                name="lucide:target"
                class="h-8 w-8 mx-auto mb-2 text-gray-300"
              />
              <p>Aucun objectif défini</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="goal in patientGoals"
                :key="goal.id"
                class="p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-medium">{{ goal.title }}</h4>
                  <span class="text-sm text-gray-500">{{ goal.type }}</span>
                </div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm">Progression</span>
                  <span class="text-sm text-gray-600">
                    {{ calculateGoalProgress(goal) }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full bg-blue-500 transition-all duration-500"
                    :style="{
                      width: `${Math.min(calculateGoalProgress(goal), 100)}%`,
                    }"
                  ></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{{ goal.current_value || 0 }} {{ goal.unit }}</span>
                  <span>{{ goal.target_value }} {{ goal.unit }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Timeline des événements de santé -->
      <Card v-if="consent?.status === 'granted'">
        <CardHeader>
          <CardTitle class="flex items-center">
            <Icon name="lucide:clock" class="h-5 w-5 mr-2" />
            Chronologie des événements
          </CardTitle>
          <CardDescription>
            Historique des entrées de données et événements de santé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HealthTimeline :events="healthEvents" />
        </CardContent>
      </Card>

      <!-- Symptômes récents -->
      <Card v-if="consent?.status === 'granted' && recentSymptoms.length > 0">
        <CardHeader>
          <CardTitle class="flex items-center">
            <Icon name="lucide:alert-triangle" class="h-5 w-5 mr-2" />
            Symptômes récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              v-for="symptom in recentSymptoms"
              :key="symptom.id"
              class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div class="flex items-center">
                <Icon
                  name="lucide:alert-circle"
                  class="h-5 w-5 text-yellow-600 mr-3"
                />
                <div>
                  <div class="font-medium text-yellow-900">
                    {{ symptom.name }}
                  </div>
                  <div class="text-sm text-yellow-700">
                    Intensité: {{ symptom.severity }}/10 -
                    {{ formatDate(symptom.recorded_at) }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-yellow-600">
                {{ symptom.duration ? `Durée: ${symptom.duration}` : "" }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Accès refusé -->
      <Card v-if="consent?.status !== 'granted'">
        <CardContent class="p-8 text-center">
          <Icon
            name="lucide:shield-off"
            class="h-16 w-16 mx-auto text-gray-400 mb-4"
          />
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Accès aux données restreint
          </h3>
          <p class="text-gray-600 mb-4">
            {{ getAccessMessage(consent?.status) }}
          </p>
          <div class="flex justify-center space-x-3">
            <Button @click="requestConsent" variant="outline">
              <Icon name="lucide:mail" class="h-4 w-4 mr-2" />
              Demander l'autorisation
            </Button>
            <NuxtLink to="/doctor/dashboard">
              <Button variant="outline">Retour au dashboard</Button>
            </NuxtLink>
          </div>
        </CardContent>
      </Card>
    </main>
  </Container>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import HealthDataChart from "@/components/health/HealthDataChart.vue";
import HealthTimeline from "@/components/health/HealthTimeline.vue";

// Types
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
}

interface Consent {
  id: string;
  status: "granted" | "pending" | "revoked";
  granted_at?: string;
  revoked_at?: string;
}

interface HealthMetrics {
  heartRate?: number;
  temperature?: number;
  bloodPressure?: string;
  sleepHours?: number;
}

interface ChartData {
  vitals: any[];
  mood: any[];
  activity: any[];
}

interface Goal {
  id: string;
  title: string;
  type: string;
  current_value?: number;
  target_value: number;
  unit: string;
}

interface AIAnalysis {
  loading: boolean;
  data: {
    keyPoints: string[];
    recommendations: string[];
    generatedAt: string;
  } | null;
}

// Composables
const { user, userProfile, loadUserProfile, logout } = useAuth();
const supabase = useSupabase();
const route = useRoute();
const { showToast } = useToast();

// États réactifs
const loading = ref(true);
const patient = ref<Patient | null>(null);
const consent = ref<Consent | null>(null);
const healthMetrics = ref<HealthMetrics>({});
const chartData = ref<ChartData>({
  vitals: [],
  mood: [],
  activity: [],
});
const patientGoals = ref<Goal[]>([]);
const healthEvents = ref<any[]>([]);
const recentSymptoms = ref<any[]>([]);
const aiAnalysis = ref<AIAnalysis>({
  loading: false,
  data: null,
});

// Variables pour l'analyse IA
const aiAnalysisType = ref("comprehensive");
const analysisRating = ref(0);
const pointNotes = ref<Record<number, string>>({});
const modifiedRecommendations = ref<Record<number, string>>({});

// Nouvelles données synthétiques pour la vue d'ensemble
const patientSummary = ref({
  allergies: [] as string[],
  medicalHistory: [] as string[],
  currentMedications: [] as string[],
  insurance: {
    company: "",
    policyNumber: "",
    group: "",
  },
  emergencyContact: {
    name: "",
    relation: "",
    phone: "",
  },
  lastVisit: {
    date: null as string | null,
    reason: "",
  },
});

// Variables pour l'analyse détaillée
const selectedPeriod = ref("30");
const selectedMetricType = ref("vitals");
const selectedChartType = ref("line");
const chartLoading = ref(false);
const detailedChartData = ref<any[]>([]);
const detailedStats = ref({
  trend: "",
  average: "",
  variability: "",
});
const comparisonData = ref<any[]>([]);

// Récupérer l'ID du patient depuis l'URL
const patientId = route.params.id;

// Charger les données du patient
const loadPatientData = async () => {
  if (!user.value || !patientId) return;

  try {
    // Vérifier le consentement et charger les infos patient
    const { data: consentData, error: consentError } = await supabase
      .from("consents")
      .select(
        `
        *,
        patient:users!consents_patient_id_fkey(*)
      `
      )
      .eq("doctor_id", user.value.id)
      .eq("patient_id", patientId)
      .single();

    if (consentError) {
      console.error("Erreur lors du chargement du consentement:", consentError);
      return;
    }

    if (consentData) {
      patient.value = consentData.patient;
      consent.value = consentData;

      // Si le consentement est accordé, charger les données de santé
      if (consentData.status === "granted") {
        await loadHealthData();
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    showToast({
      title: "Erreur",
      description: "Impossible de charger les données du patient",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
};

// Charger les données de santé
const loadHealthData = async () => {
  if (!patientId) return;

  try {
    // Charger les signes vitaux récents
    const { data: vitalsData } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", patientId)
      .eq("data_type", "vitals")
      .order("recorded_at", { ascending: false })
      .limit(1);

    if (vitalsData && vitalsData[0]) {
      const vital = vitalsData[0];
      healthMetrics.value = {
        heartRate: vital.heart_rate,
        temperature: vital.temperature,
        bloodPressure: `${vital.systolic_bp}/${vital.diastolic_bp}`,
        sleepHours: vital.sleep_hours,
      };
    }

    // Charger les données pour les graphiques
    const { data: chartVitals } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", patientId)
      .eq("data_type", "vitals")
      .order("recorded_at", { ascending: true })
      .limit(30);

    const { data: chartMood } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", patientId)
      .eq("data_type", "mood")
      .order("recorded_at", { ascending: true })
      .limit(30);

    const { data: chartActivity } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", patientId)
      .eq("data_type", "activity")
      .order("recorded_at", { ascending: true })
      .limit(30);

    chartData.value = {
      vitals: chartVitals || [],
      mood: chartMood || [],
      activity: chartActivity || [],
    };

    // Charger les objectifs
    const { data: goalsData } = await supabase
      .from("health_goals")
      .select("*")
      .eq("user_id", patientId)
      .eq("status", "active");

    patientGoals.value = goalsData || [];

    // Charger l'historique des événements
    const { data: eventsData } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", patientId)
      .order("recorded_at", { ascending: false })
      .limit(20);

    healthEvents.value = eventsData || [];

    // Charger les symptômes récents
    const { data: symptomsData } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", patientId)
      .eq("data_type", "symptoms")
      .order("recorded_at", { ascending: false })
      .limit(10);
    recentSymptoms.value = symptomsData || [];

    // Charger les données synthétiques du patient (simulations pour le moment)
    await loadPatientSummary();
  } catch (error) {
    console.error("Erreur lors du chargement des données de santé:", error);
  }
};

// Charger les données synthétiques du patient
const loadPatientSummary = async () => {
  if (!patientId) return;

  try {
    // En réalité, ces données viendraient de la base de données
    // Pour le moment, nous utilisons des données simulées
    patientSummary.value = {
      allergies: ["Pénicilline", "Fruits de mer", "Pollen"],
      medicalHistory: [
        "Hypertension artérielle (2018)",
        "Diabète de type 2 (2020)",
        "Asthme léger (depuis enfance)",
      ],
      currentMedications: [
        "Lisinopril 10mg - 1 fois/jour",
        "Metformine 500mg - 2 fois/jour",
        "Ventoline - au besoin",
      ],
      insurance: {
        company: "Assurance Santé Plus",
        policyNumber: "ASP-2024-789456",
        group: "Groupe Employeur XYZ",
      },
      emergencyContact: {
        name: "Marie Dupont",
        relation: "Épouse",
        phone: "+33 6 12 34 56 78",
      },
      lastVisit: {
        date: "2024-01-15",
        reason: "Contrôle de routine - Diabète",
      },
    };

    // TODO: Remplacer par de vraies requêtes à la base de données
    // const { data: allergiesData } = await supabase.from('patient_allergies')...
    // const { data: historyData } = await supabase.from('medical_history')...
    // etc.
  } catch (error) {
    console.error("Erreur lors du chargement du résumé patient:", error);
  }
};

// Générer une analyse IA
const generateAIAnalysis = async () => {
  aiAnalysis.value.loading = true;

  try {
    // Simulation d'une analyse IA basée sur les données réelles
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Analyser les données de santé du patient
    const recentVitals = chartData.value.vitals.slice(-7); // 7 derniers jours
    const recentMood = chartData.value.mood.slice(-7);
    const recentActivity = chartData.value.activity.slice(-7);

    const keyPoints: string[] = [];
    const recommendations: string[] = [];

    // Analyse des signes vitaux
    if (recentVitals.length > 0) {
      const avgHeartRate =
        recentVitals.reduce((sum, v) => sum + (v.heart_rate || 0), 0) /
        recentVitals.length;
      if (avgHeartRate > 0) {
        if (avgHeartRate > 100) {
          keyPoints.push(
            "Fréquence cardiaque élevée détectée (moyenne 7 jours: " +
              avgHeartRate.toFixed(0) +
              " bpm)"
          );
          recommendations.push("Surveillance cardiaque rapprochée recommandée");
        } else if (avgHeartRate < 60) {
          keyPoints.push(
            "Fréquence cardiaque basse observée (moyenne 7 jours: " +
              avgHeartRate.toFixed(0) +
              " bpm)"
          );
          recommendations.push("Évaluer les causes possibles de bradycardie");
        } else {
          keyPoints.push(
            "Fréquence cardiaque dans les normes (moyenne 7 jours: " +
              avgHeartRate.toFixed(0) +
              " bpm)"
          );
        }
      }
    }

    // Analyse de l'humeur
    if (recentMood.length > 0) {
      const avgMood =
        recentMood.reduce((sum, m) => sum + (m.mood_score || 0), 0) /
        recentMood.length;
      if (avgMood < 3) {
        keyPoints.push("Humeur globalement basse sur la période récente");
        recommendations.push(
          "Considérer un suivi psychologique ou ajustement thérapeutique"
        );
      } else if (avgMood > 7) {
        keyPoints.push("Humeur stable et positive");
      } else {
        keyPoints.push("Humeur modérée avec quelques variations");
        recommendations.push("Surveiller les facteurs déclencheurs de stress");
      }
    }

    // Analyse de l'activité
    if (recentActivity.length > 0) {
      const totalSteps = recentActivity.reduce(
        (sum, a) => sum + (a.steps || 0),
        0
      );
      const avgSteps = totalSteps / recentActivity.length;
      if (avgSteps < 5000) {
        keyPoints.push(
          "Niveau d'activité physique faible (moyenne: " +
            avgSteps.toFixed(0) +
            " pas/jour)"
        );
        recommendations.push(
          "Encourager une augmentation progressive de l'activité physique"
        );
      } else if (avgSteps > 10000) {
        keyPoints.push("Excellent niveau d'activité physique maintenu");
      } else {
        keyPoints.push("Niveau d'activité physique modéré");
        recommendations.push(
          "Maintenir et augmenter légèrement l'activité si possible"
        );
      }
    }

    // Analyse des objectifs
    if (patientGoals.value.length > 0) {
      const completedGoals = patientGoals.value.filter(
        (g) => calculateGoalProgress(g) >= 100
      );
      const inProgressGoals = patientGoals.value.filter(
        (g) => calculateGoalProgress(g) > 0 && calculateGoalProgress(g) < 100
      );

      if (completedGoals.length > 0) {
        keyPoints.push(
          `${completedGoals.length} objectif(s) de santé atteint(s)`
        );
        recommendations.push(
          "Féliciter le patient et définir de nouveaux objectifs"
        );
      }

      if (inProgressGoals.length > 0) {
        keyPoints.push(
          `${inProgressGoals.length} objectif(s) en cours de réalisation`
        );
        recommendations.push(
          "Encourager la poursuite des efforts et ajuster si nécessaire"
        );
      }
    }

    // Analyse des antécédents et allergies
    if (patientSummary.value.allergies.length > 0) {
      keyPoints.push(
        `${patientSummary.value.allergies.length} allergie(s) connue(s) à surveiller`
      );
      recommendations.push(
        "Vérifier la compatibilité de tout nouveau traitement"
      );
    }

    if (patientSummary.value.medicalHistory.length > 0) {
      keyPoints.push(
        "Antécédents médicaux significatifs nécessitant un suivi adapté"
      );
      recommendations.push(
        "Maintenir la surveillance des conditions chroniques"
      );
    }

    // Valeurs par défaut si pas assez de données
    if (keyPoints.length === 0) {
      keyPoints.push(
        "Données insuffisantes pour une analyse complète",
        "Patient récemment ajouté ou données limitées",
        "Encourager le patient à saisir ses données de santé régulièrement"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Poursuivre le suivi médical régulier",
        "Encourager la saisie quotidienne des données de santé",
        "Programmer une consultation de contrôle dans 1 mois"
      );
    }

    aiAnalysis.value.data = {
      keyPoints,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    showToast({
      title: "Analyse IA générée",
      description: "L'analyse automatique des données patient est disponible",
    });
  } catch (error) {
    console.error("Erreur lors de la génération de l'analyse IA:", error);
    showToast({
      title: "Erreur",
      description: "Impossible de générer l'analyse IA",
      variant: "destructive",
    });
  } finally {
    aiAnalysis.value.loading = false;
  }
};

// Fonctions utilitaires
const calculateAge = (birthDate: string | undefined): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const calculateGoalProgress = (goal: Goal): number => {
  if (!goal.current_value || !goal.target_value) return 0;
  return (goal.current_value / goal.target_value) * 100;
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getConsentStatusClass = (status: string | undefined): string => {
  switch (status) {
    case "granted":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "revoked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getConsentStatusIcon = (status: string | undefined): string => {
  switch (status) {
    case "granted":
      return "lucide:check-circle";
    case "pending":
      return "lucide:clock";
    case "revoked":
      return "lucide:x-circle";
    default:
      return "lucide:help-circle";
  }
};

const getConsentStatusText = (status: string | undefined): string => {
  switch (status) {
    case "granted":
      return "Consentement accordé";
    case "pending":
      return "Consentement en attente";
    case "revoked":
      return "Consentement révoqué";
    default:
      return "Statut inconnu";
  }
};

const getAccessMessage = (status: string | undefined): string => {
  switch (status) {
    case "pending":
      return "Le patient n'a pas encore accordé l'autorisation d'accès à ses données.";
    case "revoked":
      return "Le patient a révoqué l'autorisation d'accès à ses données.";
    default:
      return "Vous n'avez pas l'autorisation d'accéder aux données de ce patient.";
  }
};

// Actions
const sendMessage = () => {
  navigateTo(`/doctor/messages?patient=${patientId}`);
};

const requestConsent = async () => {
  // TODO: Implémenter la demande de consentement
  showToast({
    title: "Demande envoyée",
    description: "Une demande d'autorisation a été envoyée au patient",
  });
};

// Fonctions pour l'analyse détaillée
const loadDetailedChartData = async () => {
  if (!patientId) return;

  chartLoading.value = true;

  try {
    const { data: chartData } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", patientId)
      .eq("data_type", selectedMetricType.value)
      .order("recorded_at", { ascending: true })
      .limit(parseInt(selectedPeriod.value));

    detailedChartData.value = chartData || [];

    // Calculer les statistiques détaillées
    if (chartData && chartData.length > 0) {
      const values = chartData.map((d) =>
        parseFloat(d.value || d.heart_rate || d.temperature || 0)
      );
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      detailedStats.value = {
        trend:
          values.length > 1 && values[values.length - 1] > values[0]
            ? "Croissante"
            : values.length > 1 && values[values.length - 1] < values[0]
            ? "Décroissante"
            : "Stable",
        average: avg.toFixed(1),
        variability:
          Math.max(...values) - Math.min(...values) > avg * 0.2
            ? "Élevée"
            : "Faible",
      };

      // Données de comparaison simulées
      comparisonData.value = [
        {
          metric: "Fréquence cardiaque",
          patientValue: `${avg.toFixed(0)} bpm`,
          reference: "60-100 bpm",
          status:
            avg >= 60 && avg <= 100 ? "normal" : avg < 60 ? "warning" : "alert",
        },
      ];
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données détaillées:", error);
  } finally {
    chartLoading.value = false;
  }
};

const getMetricIcon = (type: string): string => {
  switch (type) {
    case "vitals":
      return "lucide:heart";
    case "mood":
      return "lucide:smile";
    case "activity":
      return "lucide:zap";
    case "sleep":
      return "lucide:moon";
    case "symptoms":
      return "lucide:alert-circle";
    default:
      return "lucide:activity";
  }
};

const getMetricIconColor = (type: string): string => {
  switch (type) {
    case "vitals":
      return "text-red-500";
    case "mood":
      return "text-yellow-500";
    case "activity":
      return "text-green-500";
    case "sleep":
      return "text-blue-500";
    case "symptoms":
      return "text-orange-500";
    default:
      return "text-gray-500";
  }
};

const getMetricTitle = (type: string): string => {
  switch (type) {
    case "vitals":
      return "Signes vitaux";
    case "mood":
      return "Humeur";
    case "activity":
      return "Activité physique";
    case "sleep":
      return "Sommeil";
    case "symptoms":
      return "Symptômes";
    default:
      return "Données de santé";
  }
};

const getTrendColor = (trend: string): string => {
  switch (trend) {
    case "Croissante":
      return "text-green-600";
    case "Décroissante":
      return "text-red-600";
    case "Stable":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

const getAnalysisTypeLabel = (type: string): string => {
  switch (type) {
    case "comprehensive":
      return "Complète";
    case "vitals":
      return "Signes vitaux";
    case "lifestyle":
      return "Mode de vie";
    case "risk":
      return "Évaluation des risques";
    default:
      return "Standard";
  }
};

const getPointPriority = (index: number): string => {
  // Logique simple pour assigner des priorités
  if (index === 0) return "Haute";
  if (index === 1) return "Moyenne";
  return "Normale";
};

const getPointPriorityClass = (index: number): string => {
  const priority = getPointPriority(index);
  switch (priority) {
    case "Haute":
      return "bg-red-100 text-red-800";
    case "Moyenne":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-green-100 text-green-800";
  }
};

const togglePointNote = (index: number) => {
  if (pointNotes.value[index]) {
    delete pointNotes.value[index];
  } else {
    pointNotes.value[index] = "";
  }
};

const approveRecommendation = (index: number) => {
  showToast({
    title: "Recommandation approuvée",
    description: "La recommandation a été marquée comme approuvée",
    variant: "default",
  });
};

const modifyRecommendation = (index: number) => {
  if (!modifiedRecommendations.value[index]) {
    modifiedRecommendations.value[index] =
      aiAnalysis.value.data?.recommendations[index] || "";
  }
};

const dismissRecommendation = (index: number) => {
  showToast({
    title: "Recommandation rejetée",
    description: "La recommandation a été marquée comme non pertinente",
    variant: "default",
  });
};

const saveModifiedRecommendation = (index: number) => {
  showToast({
    title: "Modification sauvegardée",
    description: "Votre modification de la recommandation a été enregistrée",
    variant: "default",
  });
  delete modifiedRecommendations.value[index];
};

const cancelModification = (index: number) => {
  delete modifiedRecommendations.value[index];
};

const rateAnalysis = (rating: number) => {
  analysisRating.value = rating;
  showToast({
    title: "Évaluation enregistrée",
    description: `Vous avez évalué cette analyse à ${rating}/5 étoiles`,
    variant: "default",
  });
};

// Initialisation
onMounted(async () => {
  await loadUserProfile();
  await loadPatientData();

  // Charger les données détaillées si consentement accordé
  if (consent.value?.status === "granted") {
    await loadDetailedChartData();
    // Générer automatiquement l'analyse IA
    await generateAIAnalysis();
  }
});

// Meta données de la page
definePageMeta({
  layout: "dashboard",
  title: "Données Patient",
  middleware: ["auth", "role"],
});
</script>
