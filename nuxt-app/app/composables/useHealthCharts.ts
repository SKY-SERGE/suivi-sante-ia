export interface ChartDataPoint {
  value: number;
  date: string;
  label?: string;
  metadata?: Record<string, any>;
  isHighlight?: boolean;
}

export interface PieChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface BarChartDataPoint {
  label: string;
  value: number;
  date?: string;
  metadata?: Record<string, any>;
}

export interface ChartOptions {
  title: string;
  description?: string;
  unit?: string;
  colorScheme?:
    | "blue"
    | "green"
    | "purple"
    | "gradient"
    | "health"
    | "default"
    | "mood"
    | "rainbow";
  showTrendLine?: boolean;
  showValues?: boolean;
  showAverageLine?: boolean;
  showLegend?: boolean;
  showStats?: boolean;
  period?: 7 | 30 | 90 | 365;
}

export const useHealthCharts = () => {
  // Transformer les données de santé en données de graphique
  const transformHealthDataForChart = (
    data: Array<{
      id: string;
      data_type: string;
      value?: number;
      unit?: string;
      recorded_at: string;
      metadata?: Record<string, any>;
    }>,
    dataType: string
  ): ChartDataPoint[] => {
    return data
      .filter((item) => item.data_type === dataType && item.value !== undefined)
      .map((item) => ({
        value: item.value!,
        date: item.recorded_at,
        label: formatChartDate(item.recorded_at),
        metadata: item.metadata,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Analyser les données par période pour un graphique en barres
  const analyzeDataByPeriod = (
    data: ChartDataPoint[],
    period: "day" | "week" | "month" = "week"
  ): BarChartDataPoint[] => {
    const groupedData = new Map<string, number[]>();

    data.forEach((item) => {
      const date = new Date(item.date);
      let key: string;
      switch (period) {
        case "day":
          key = date.toISOString().split("T")[0] || "";
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0] || "";
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
      }

      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key)!.push(item.value);
    });

    return Array.from(groupedData.entries())
      .map(([key, values]) => ({
        label: formatPeriodLabel(key, period),
        value: values.reduce((sum, val) => sum + val, 0) / values.length,
        date: key,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Analyser la distribution des données pour un graphique circulaire
  const analyzeDataDistribution = (
    data: ChartDataPoint[],
    ranges: Array<{ label: string; min: number; max: number; color?: string }>
  ): PieChartDataPoint[] => {
    const distribution = ranges.map((range) => ({
      ...range,
      count: 0,
    }));

    data.forEach((item) => {
      const range = distribution.find(
        (r) => item.value >= r.min && item.value < r.max
      );
      if (range) {
        range.count++;
      }
    });

    return distribution
      .filter((range) => range.count > 0)
      .map((range) => ({
        label: range.label,
        value: range.count,
        color: range.color,
      }));
  };

  // Calculer les statistiques de base
  const calculateStats = (data: ChartDataPoint[]) => {
    if (data.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        median: 0,
        trend: "stable" as "increasing" | "decreasing" | "stable",
      };
    }

    const values = data.map((item) => item.value).sort((a, b) => a - b);
    const min = values[0];
    const max = values[values.length - 1];
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median =
      values.length % 2 === 0
        ? ((values[values.length / 2 - 1] || 0) +
            (values[values.length / 2] || 0)) /
          2
        : values[Math.floor(values.length / 2)] || 0;

    // Analyser la tendance
    let trend: "increasing" | "decreasing" | "stable" = "stable";
    if (data.length >= 3) {
      const recent = data.slice(-Math.ceil(data.length / 3));
      const older = data.slice(0, Math.ceil(data.length / 3));

      const recentAvg =
        recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
      const olderAvg =
        older.reduce((sum, item) => sum + item.value, 0) / older.length;

      const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

      if (changePercent > 5) trend = "increasing";
      else if (changePercent < -5) trend = "decreasing";
    }

    return { min, max, average, median, trend };
  };

  // Générer des recommandations basées sur les données
  const generateHealthInsights = (
    dataType: string,
    stats: ReturnType<typeof calculateStats>,
    data: ChartDataPoint[]
  ): string[] => {
    const insights: string[] = [];

    switch (dataType) {
      case "mood":
        if (stats.average < 5) {
          insights.push(
            "Votre humeur moyenne est en dessous de la normale. Considérez des activités relaxantes."
          );
        }
        if (stats.trend === "decreasing") {
          insights.push(
            "Votre humeur semble en baisse récemment. N'hésitez pas à consulter un professionnel."
          );
        }
        if (stats.trend === "increasing") {
          insights.push("Excellente nouvelle ! Votre humeur s'améliore.");
        }
        break;

      case "sleep":
        if (stats.average < 7) {
          insights.push(
            "Vous ne dormez pas assez. Essayez de vous coucher plus tôt."
          );
        }
        if (stats.average > 9) {
          insights.push(
            "Vous dormez beaucoup. Vérifiez la qualité de votre sommeil."
          );
        }
        if (stats.trend === "decreasing") {
          insights.push(
            "Votre temps de sommeil diminue. Établissez une routine de coucher."
          );
        }
        break;

      case "weight":
        if (stats.trend === "increasing") {
          insights.push(
            "Votre poids augmente. Vérifiez que cela correspond à vos objectifs."
          );
        }
        if (stats.trend === "decreasing") {
          insights.push(
            "Votre poids diminue. Assurez-vous que c'est intentionnel."
          );
        }
        break;

      case "heart_rate":
        if (stats.average > 100) {
          insights.push(
            "Votre fréquence cardiaque moyenne est élevée. Consultez un médecin si nécessaire."
          );
        }
        if (stats.average < 60) {
          insights.push(
            "Votre fréquence cardiaque est basse. Cela peut être normal si vous êtes sportif."
          );
        }
        break;
    }

    // Insights généraux
    if (data.length < 7) {
      insights.push(
        "Continuez à enregistrer vos données pour obtenir des analyses plus précises."
      );
    }

    return insights;
  };

  // Définir les plages de valeurs pour différents types de données
  const getHealthRanges = (dataType: string) => {
    const ranges: Record<
      string,
      Array<{ label: string; min: number; max: number; color?: string }>
    > = {
      mood: [
        { label: "Très bas", min: 1, max: 3, color: "#ef4444" },
        { label: "Bas", min: 3, max: 5, color: "#f97316" },
        { label: "Moyen", min: 5, max: 7, color: "#eab308" },
        { label: "Bon", min: 7, max: 9, color: "#84cc16" },
        { label: "Excellent", min: 9, max: 11, color: "#22c55e" },
      ],
      sleep: [
        { label: "Insuffisant", min: 0, max: 6, color: "#ef4444" },
        { label: "Limite", min: 6, max: 7, color: "#f97316" },
        { label: "Bon", min: 7, max: 9, color: "#22c55e" },
        { label: "Trop", min: 9, max: 15, color: "#06b6d4" },
      ],
      heart_rate: [
        { label: "Bradycardie", min: 0, max: 60, color: "#06b6d4" },
        { label: "Normal", min: 60, max: 100, color: "#22c55e" },
        { label: "Tachycardie", min: 100, max: 200, color: "#ef4444" },
      ],
    };

    return ranges[dataType] || [];
  };

  // Formater les dates pour l'affichage
  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatPeriodLabel = (key: string, period: "day" | "week" | "month") => {
    const date = new Date(key);

    switch (period) {
      case "day":
        return date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        });
      case "week":
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + 6);
        return `${date.getDate()}/${
          date.getMonth() + 1
        } - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
      case "month":
        return date.toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        });
      default:
        return key;
    }
  };

  // Obtenir les couleurs par type de données
  const getDataTypeColor = (dataType: string): string => {
    const colors: Record<string, string> = {
      mood: "#22c55e",
      sleep: "#3b82f6",
      activity: "#f59e0b",
      weight: "#8b5cf6",
      heart_rate: "#ef4444",
      blood_pressure: "#06b6d4",
      temperature: "#f97316",
    };

    return colors[dataType] || "#6b7280";
  };

  return {
    transformHealthDataForChart,
    analyzeDataByPeriod,
    analyzeDataDistribution,
    calculateStats,
    generateHealthInsights,
    getHealthRanges,
    formatChartDate,
    formatPeriodLabel,
    getDataTypeColor,
  };
};
