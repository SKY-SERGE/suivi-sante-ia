/**
 * Composable pour la validation des données de santé
 * Fournit des fonctions de validation pour différents types de données médicales
 */

interface ValidationResult {
  isValid: boolean;
  message?: string;
  warnings?: string[];
}

export const useHealthValidation = () => {
  /**
   * Valide les données de tension artérielle
   */
  const validateBloodPressure = (
    systolic: number,
    diastolic: number
  ): ValidationResult => {
    if (!systolic || !diastolic) {
      return {
        isValid: false,
        message: "Veuillez saisir les deux valeurs de tension",
      };
    }

    if (systolic < 50 || systolic > 300) {
      return {
        isValid: false,
        message: "La pression systolique doit être entre 50 et 300 mmHg",
      };
    }

    if (diastolic < 30 || diastolic > 200) {
      return {
        isValid: false,
        message: "La pression diastolique doit être entre 30 et 200 mmHg",
      };
    }

    if (systolic <= diastolic) {
      return {
        isValid: false,
        message: "La pression systolique doit être supérieure à la diastolique",
      };
    }

    const warnings = [];

    // Hypotension
    if (systolic < 90 || diastolic < 60) {
      warnings.push(
        "Ces valeurs peuvent indiquer une hypotension. Consultez votre médecin si vous ressentez des symptômes."
      );
    }

    // Hypertension
    if (systolic >= 180 || diastolic >= 110) {
      warnings.push(
        "Ces valeurs indiquent une hypertension sévère. Consultez rapidement un médecin."
      );
    } else if (systolic >= 140 || diastolic >= 90) {
      warnings.push(
        "Ces valeurs peuvent indiquer une hypertension. Consultez votre médecin."
      );
    }

    return { isValid: true, warnings };
  };

  /**
   * Valide le poids
   */
  const validateWeight = (weight: number): ValidationResult => {
    if (!weight) {
      return { isValid: false, message: "Veuillez saisir votre poids" };
    }

    if (weight < 20 || weight > 500) {
      return {
        isValid: false,
        message: "Le poids doit être entre 20 et 500 kg",
      };
    }

    const warnings = [];

    if (weight < 40) {
      warnings.push(
        "Ce poids semble très faible. Consultez votre médecin si nécessaire."
      );
    } else if (weight > 200) {
      warnings.push(
        "Ce poids semble très élevé. Consultez votre médecin pour un suivi approprié."
      );
    }

    return { isValid: true, warnings };
  };

  /**
   * Valide la température corporelle
   */
  const validateTemperature = (temperature: number): ValidationResult => {
    if (!temperature) {
      return { isValid: false, message: "Veuillez saisir la température" };
    }

    if (temperature < 30 || temperature > 45) {
      return {
        isValid: false,
        message: "La température doit être entre 30 et 45°C",
      };
    }

    const warnings = [];

    if (temperature < 35) {
      warnings.push(
        "Hypothermie possible. Consultez immédiatement un médecin."
      );
    } else if (temperature < 36) {
      warnings.push("Température corporelle basse. Surveillez votre état.");
    } else if (temperature > 38.5) {
      warnings.push("Fièvre détectée. Consultez un médecin si elle persiste.");
    } else if (temperature > 40) {
      warnings.push("Fièvre élevée. Consultez immédiatement un médecin.");
    }

    return { isValid: true, warnings };
  };

  /**
   * Valide la fréquence cardiaque
   */
  const validateHeartRate = (heartRate: number): ValidationResult => {
    if (!heartRate) {
      return {
        isValid: false,
        message: "Veuillez saisir la fréquence cardiaque",
      };
    }

    if (heartRate < 30 || heartRate > 250) {
      return {
        isValid: false,
        message: "La fréquence cardiaque doit être entre 30 et 250 bpm",
      };
    }

    const warnings = [];

    if (heartRate < 50) {
      warnings.push(
        "Bradycardie possible. Consultez votre médecin si vous avez des symptômes."
      );
    } else if (heartRate > 100) {
      warnings.push(
        "Tachycardie possible. Consultez votre médecin si elle persiste au repos."
      );
    } else if (heartRate > 150) {
      warnings.push(
        "Fréquence cardiaque très élevée. Consultez immédiatement un médecin."
      );
    }

    return { isValid: true, warnings };
  };

  /**
   * Valide l'humeur (échelle 1-10)
   */
  const validateMood = (mood: number): ValidationResult => {
    if (!mood) {
      return {
        isValid: false,
        message: "Veuillez sélectionner votre niveau d'humeur",
      };
    }

    if (mood < 1 || mood > 10) {
      return {
        isValid: false,
        message: "L'humeur doit être notée entre 1 et 10",
      };
    }

    const warnings = [];

    if (mood <= 3) {
      warnings.push(
        "Votre humeur semble très basse. N'hésitez pas à parler à un professionnel de santé."
      );
    } else if (mood <= 5) {
      warnings.push("Votre humeur semble basse. Prenez soin de vous.");
    }

    return { isValid: true, warnings };
  };

  /**
   * Valide les heures de sommeil
   */
  const validateSleep = (hours: number): ValidationResult => {
    if (!hours) {
      return {
        isValid: false,
        message: "Veuillez saisir le nombre d'heures de sommeil",
      };
    }

    if (hours < 0 || hours > 24) {
      return {
        isValid: false,
        message: "Les heures de sommeil doivent être entre 0 et 24",
      };
    }

    const warnings = [];

    if (hours < 4) {
      warnings.push(
        "Temps de sommeil très court. Un sommeil insuffisant peut affecter votre santé."
      );
    } else if (hours < 6) {
      warnings.push(
        "Temps de sommeil court. Essayez de dormir 7-9 heures par nuit."
      );
    } else if (hours > 12) {
      warnings.push(
        "Temps de sommeil très long. Consultez votre médecin si cela devient habituel."
      );
    }

    return { isValid: true, warnings };
  };

  /**
   * Valide une date de saisie
   */
  const validateDate = (date: string): ValidationResult => {
    if (!date) {
      return { isValid: false, message: "Veuillez saisir une date" };
    }

    const inputDate = new Date(date);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    if (inputDate > today) {
      return {
        isValid: false,
        message: "La date ne peut pas être dans le futur",
      };
    }

    if (inputDate < oneYearAgo) {
      return {
        isValid: false,
        message: "La date ne peut pas être antérieure à un an",
      };
    }

    return { isValid: true };
  };

  /**
   * Fonction générique de validation selon le type de données
   */
  const validateHealthData = (
    type: string,
    value: any,
    metadata?: any
  ): ValidationResult => {
    switch (type) {
      case "blood_pressure":
        if (metadata?.systolic && metadata?.diastolic) {
          return validateBloodPressure(metadata.systolic, metadata.diastolic);
        }
        return {
          isValid: false,
          message: "Données de tension artérielle manquantes",
        };

      case "weight":
        return validateWeight(value);

      case "temperature":
        return validateTemperature(value);

      case "heart_rate":
        return validateHeartRate(value);

      case "mood":
        return validateMood(value);

      case "sleep":
        return validateSleep(value);

      default:
        return { isValid: true };
    }
  };

  return {
    validateBloodPressure,
    validateWeight,
    validateTemperature,
    validateHeartRate,
    validateMood,
    validateSleep,
    validateDate,
    validateHealthData,
  };
};
