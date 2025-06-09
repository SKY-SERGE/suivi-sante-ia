/**
 * Composable pour la gestion et le traitement des images de repas
 */

export interface ProcessedImage {
  originalFile: File;
  processedBlob: Blob;
  processedDataUrl: string;
  originalDataUrl: string;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  format: string;
  timestamp: string;
  isCompressed: boolean;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "webp" | "png";
  removeExif?: boolean;
}

export const useImageProcessing = () => {
  const isProcessing = ref(false);
  const processingProgress = ref(0);

  /**
   * Valide un fichier image
   */
  const validateImageFile = (
    file: File
  ): { isValid: boolean; error?: string } => {
    // Vérifier le type MIME
    if (!file.type.startsWith("image/")) {
      return { isValid: false, error: "Le fichier doit être une image." };
    }

    // Vérifier la taille (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "L'image est trop volumineuse (max: 10MB).",
      };
    }

    // Vérifier les formats supportés
    const supportedFormats = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
    ];
    if (!supportedFormats.includes(file.type)) {
      return { isValid: false, error: "Format d'image non supporté." };
    }

    return { isValid: true };
  };

  /**
   * Lit un fichier et crée une URL de prévisualisation
   */
  const createPreviewUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Obtient les dimensions d'une image
   */
  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  /**
   * Compresse et redimensionne une image
   */
  const processImage = async (
    file: File,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> => {
    isProcessing.value = true;
    processingProgress.value = 0;

    try {
      const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.8,
        format = "jpeg",
        removeExif = true,
      } = options;

      processingProgress.value = 20;

      // Obtenir les dimensions originales
      const originalDimensions = await getImageDimensions(file);
      processingProgress.value = 40;

      // Créer l'URL de prévisualisation originale
      const originalDataUrl = await createPreviewUrl(file);
      processingProgress.value = 60;

      // Créer un canvas pour le traitement
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Impossible de créer le contexte canvas");

      // Calculer les nouvelles dimensions en préservant le ratio
      let { width, height } = originalDimensions;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Charger et dessiner l'image
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = originalDataUrl;
      });

      processingProgress.value = 80;

      // Appliquer des filtres d'amélioration de base
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Améliorer le contraste et la luminosité pour l'analyse IA
      if (format === "jpeg") {
        const imageData = ctx.getImageData(0, 0, width, height);
        enhanceImageForAI(imageData);
        ctx.putImageData(imageData, 0, 0);
      }

      processingProgress.value = 90;

      // Convertir en blob
      const processedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Échec de la conversion en blob"));
          },
          `image/${format}`,
          quality
        );
      });

      // Créer l'URL de données pour la prévisualisation
      const processedDataUrl = URL.createObjectURL(processedBlob);

      processingProgress.value = 100;

      const metadata: ImageMetadata = {
        fileName: `processed_${Date.now()}.${format}`,
        fileSize: processedBlob.size,
        dimensions: { width, height },
        format,
        timestamp: new Date().toISOString(),
        isCompressed: processedBlob.size < file.size,
      };

      return {
        originalFile: file,
        processedBlob,
        processedDataUrl,
        originalDataUrl,
        metadata,
      };
    } finally {
      isProcessing.value = false;
      processingProgress.value = 0;
    }
  };

  /**
   * Améliore une image pour l'analyse IA
   */
  const enhanceImageForAI = (imageData: ImageData) => {
    const data = imageData.data;
    const contrast = 1.2;
    const brightness = 10;

    for (let i = 0; i < data.length; i += 4) {
      // Appliquer contraste et luminosité
      data[i] = Math.min(
        255,
        Math.max(0, contrast * ((data[i] || 0) - 128) + 128 + brightness)
      ); // Rouge
      data[i + 1] = Math.min(
        255,
        Math.max(0, contrast * ((data[i + 1] || 0) - 128) + 128 + brightness)
      ); // Vert
      data[i + 2] = Math.min(
        255,
        Math.max(0, contrast * ((data[i + 2] || 0) - 128) + 128 + brightness)
      ); // Bleu
    }
  };

  /**
   * Convertit un blob en base64
   */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /**
   * Redimensionne une image pour l'upload
   */
  const resizeForUpload = async (file: File): Promise<Blob> => {
    const processed = await processImage(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.7,
      format: "jpeg",
    });
    return processed.processedBlob;
  };

  /**
   * Créer une miniature
   */
  const createThumbnail = async (file: File): Promise<Blob> => {
    const processed = await processImage(file, {
      maxWidth: 200,
      maxHeight: 200,
      quality: 0.6,
      format: "jpeg",
    });
    return processed.processedBlob;
  };

  /**
   * Nettoie les URLs créées
   */
  const cleanupUrls = (...urls: string[]) => {
    urls.forEach((url) => {
      if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
  };

  return {
    // État
    isProcessing: readonly(isProcessing),
    processingProgress: readonly(processingProgress),

    // Méthodes
    validateImageFile,
    createPreviewUrl,
    getImageDimensions,
    processImage,
    blobToBase64,
    resizeForUpload,
    createThumbnail,
    cleanupUrls,
  };
};
