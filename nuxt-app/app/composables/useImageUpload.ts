/**
 * Composable pour l'upload et le stockage des images de repas
 */

export interface UploadProgress {
  percentage: number;
  stage: "preparing" | "uploading" | "processing" | "complete" | "error";
  message: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  uploadedAt: string;
  metadata: Record<string, any>;
}

export interface UploadError {
  code: string;
  message: string;
  details?: any;
}

export const useImageUpload = () => {
  const supabase = useSupabase();
  const { user } = useSupabaseUser();

  const isUploading = ref(false);
  const uploadProgress = ref<UploadProgress | null>(null);
  const lastUploadedImage = ref<UploadedImage | null>(null);
  const uploadError = ref<UploadError | null>(null);

  /**
   * Upload une image vers Supabase Storage
   */
  const uploadImage = async (
    processedImage: ProcessedImage,
    folder: string = "meals"
  ): Promise<UploadedImage> => {
    if (!user.value) {
      throw new Error("Utilisateur non authentifié");
    }

    isUploading.value = true;
    uploadError.value = null;

    try {
      // Étape 1: Préparation
      uploadProgress.value = {
        percentage: 10,
        stage: "preparing",
        message: "Préparation de l'upload...",
      };

      const userId = user.value.id;
      const fileName = `${userId}/${folder}/${Date.now()}_${
        processedImage.metadata.fileName
      }`;
      const thumbnailFileName = `${userId}/${folder}/thumbnails/${Date.now()}_thumb_${
        processedImage.metadata.fileName
      }`;

      // Étape 2: Upload de l'image principale
      uploadProgress.value = {
        percentage: 30,
        stage: "uploading",
        message: "Upload de l'image principale...",
      };

      const { data: imageData, error: imageError } = await supabase.storage
        .from("meal-images")
        .upload(fileName, processedImage.processedBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: `image/${processedImage.metadata.format}`,
        });

      if (imageError) {
        throw new Error(`Erreur upload image: ${imageError.message}`);
      }

      // Étape 3: Créer et uploader la miniature
      uploadProgress.value = {
        percentage: 60,
        stage: "processing",
        message: "Création de la miniature...",
      };

      const { createThumbnail } = useImageProcessing();
      const thumbnailBlob = await createThumbnail(processedImage.originalFile);

      const { data: thumbnailData, error: thumbnailError } =
        await supabase.storage
          .from("meal-images")
          .upload(thumbnailFileName, thumbnailBlob, {
            cacheControl: "3600",
            upsert: false,
            contentType: "image/jpeg",
          });

      if (thumbnailError) {
        console.warn("Erreur upload miniature:", thumbnailError);
        // Continue sans miniature
      }

      // Étape 4: Obtenir les URLs publiques
      uploadProgress.value = {
        percentage: 80,
        stage: "processing",
        message: "Génération des URLs...",
      };

      const { data: imageUrl } = supabase.storage
        .from("meal-images")
        .getPublicUrl(fileName);

      const { data: thumbnailUrl } = thumbnailData
        ? supabase.storage.from("meal-images").getPublicUrl(thumbnailFileName)
        : { data: { publicUrl: imageUrl.publicUrl } };

      // Étape 5: Enregistrer les métadonnées en base
      uploadProgress.value = {
        percentage: 90,
        stage: "processing",
        message: "Enregistrement des métadonnées...",
      };

      const imageRecord = {
        id: crypto.randomUUID(),
        user_id: userId,
        file_name: processedImage.metadata.fileName,
        file_path: fileName,
        thumbnail_path: thumbnailData?.path || null,
        file_size: processedImage.metadata.fileSize,
        width: processedImage.metadata.dimensions.width,
        height: processedImage.metadata.dimensions.height,
        format: processedImage.metadata.format,
        upload_url: imageUrl.publicUrl,
        thumbnail_url: thumbnailUrl.publicUrl,
        metadata: {
          originalSize: processedImage.originalFile.size,
          isCompressed: processedImage.metadata.isCompressed,
          processedAt: processedImage.metadata.timestamp,
        },
        created_at: new Date().toISOString(),
      };

      const { data: savedImage, error: saveError } = await supabase
        .from("meal_images")
        .insert(imageRecord)
        .select()
        .single();

      if (saveError) {
        console.warn("Erreur sauvegarde métadonnées:", saveError);
        // Continue sans métadonnées en base
      }

      // Étape 6: Finalisation
      uploadProgress.value = {
        percentage: 100,
        stage: "complete",
        message: "Upload terminé avec succès!",
      };

      const uploadedImage: UploadedImage = {
        id: imageRecord.id,
        url: imageUrl.publicUrl,
        thumbnailUrl: thumbnailUrl.publicUrl,
        fileName: processedImage.metadata.fileName,
        fileSize: processedImage.metadata.fileSize,
        dimensions: processedImage.metadata.dimensions,
        uploadedAt: new Date().toISOString(),
        metadata: imageRecord.metadata,
      };

      lastUploadedImage.value = uploadedImage;
      return uploadedImage;
    } catch (error) {
      uploadError.value = {
        code: "UPLOAD_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Erreur inconnue lors de l'upload",
        details: error,
      };

      uploadProgress.value = {
        percentage: 0,
        stage: "error",
        message: uploadError.value.message,
      };

      throw error;
    } finally {
      isUploading.value = false;

      // Reset progress après un délai
      setTimeout(() => {
        uploadProgress.value = null;
      }, 3000);
    }
  };

  /**
   * Upload multiple images
   */
  const uploadMultipleImages = async (
    processedImages: ProcessedImage[],
    folder: string = "meals"
  ): Promise<UploadedImage[]> => {
    const results: UploadedImage[] = [];
    const errors: Error[] = [];

    for (const [index, image] of processedImages.entries()) {
      try {
        uploadProgress.value = {
          percentage: (index / processedImages.length) * 100,
          stage: "uploading",
          message: `Upload ${index + 1}/${processedImages.length}...`,
        };

        const result = await uploadImage(image, folder);
        results.push(result);
      } catch (error) {
        errors.push(error as Error);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error(
        `Échec de tous les uploads: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    return results;
  };

  /**
   * Supprime une image du stockage
   */
  const deleteImage = async (imagePath: string): Promise<void> => {
    const { error } = await supabase.storage
      .from("meal-images")
      .remove([imagePath]);

    if (error) {
      throw new Error(`Erreur suppression image: ${error.message}`);
    }

    // Supprimer aussi les métadonnées
    await supabase.from("meal_images").delete().eq("file_path", imagePath);
  };

  /**
   * Récupère les images d'un utilisateur
   */
  const getUserImages = async (
    limit: number = 50
  ): Promise<UploadedImage[]> => {
    if (!user.value) return [];

    const { data, error } = await supabase
      .from("meal_images")
      .select("*")
      .eq("user_id", user.value.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erreur récupération images:", error);
      return [];
    }

    return data.map((img: any) => ({
      id: img.id,
      url: img.upload_url,
      thumbnailUrl: img.thumbnail_url || img.upload_url,
      fileName: img.file_name,
      fileSize: img.file_size,
      dimensions: { width: img.width, height: img.height },
      uploadedAt: img.created_at,
      metadata: img.metadata || {},
    }));
  };

  /**
   * Nettoie les uploads échoués/orphelins
   */
  const cleanupFailedUploads = async (): Promise<void> => {
    // Implémenter la logique de nettoyage si nécessaire
    console.log("Nettoyage des uploads échoués...");
  };

  /**
   * Reset l'état d'upload
   */
  const resetUploadState = () => {
    isUploading.value = false;
    uploadProgress.value = null;
    uploadError.value = null;
  };

  return {
    // État
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    lastUploadedImage: readonly(lastUploadedImage),
    uploadError: readonly(uploadError),

    // Méthodes
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    getUserImages,
    cleanupFailedUploads,
    resetUploadState,
  };
};
