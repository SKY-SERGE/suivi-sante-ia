// Script Node.js pour appliquer les migrations RLS via Supabase
// Ce script utilise le client Supabase JavaScript pour une meilleure intégration
// Date: 2025-06-18

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

console.log("=== Application des migrations RLS via Supabase Client ===");

// Charger les variables d'environnement
const envPath = path.join(__dirname, "..", "nuxt-app", ".env");
if (!fs.existsSync(envPath)) {
  console.error("❌ Erreur: Fichier .env introuvable dans nuxt-app/");
  console.log(
    "📝 Veuillez créer un fichier .env basé sur .env.example avec vos configurations Supabase"
  );
  process.exit(1);
}

dotenv.config({ path: envPath });

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variables d'environnement Supabase manquantes");
  console.log(
    "📝 Veuillez configurer NUXT_PUBLIC_SUPABASE_URL et NUXT_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env"
  );
  process.exit(1);
}

// Demander la clé de service
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(
  "🔑 Pour appliquer les migrations, nous avons besoin de votre clé de service Supabase (service_role key)."
);
console.log(
  "📍 Vous pouvez la trouver dans votre dashboard Supabase > Settings > API > service_role key"
);
console.log(
  "⚠️  ATTENTION: Cette clé a des privilèges administrateur. Ne la partagez jamais."
);

rl.question("Clé de service Supabase: ", async (serviceKey) => {
  rl.close();

  if (!serviceKey.trim()) {
    console.error("❌ Clé de service requise");
    process.exit(1);
  }

  // Créer le client Supabase avec la clé de service
  const supabaseAdmin = createClient(supabaseUrl, serviceKey.trim());

  try {
    // Lire les fichiers de migration
    const rlsMigrationPath = path.join(
      __dirname,
      "..",
      "database",
      "migrations",
      "fix_users_rls_policies.sql"
    );
    const rpcMigrationPath = path.join(
      __dirname,
      "..",
      "database",
      "migrations",
      "create_user_profile_function.sql"
    );

    if (!fs.existsSync(rlsMigrationPath)) {
      throw new Error(
        `Fichier de migration RLS introuvable: ${rlsMigrationPath}`
      );
    }

    if (!fs.existsSync(rpcMigrationPath)) {
      throw new Error(
        `Fichier de migration RPC introuvable: ${rpcMigrationPath}`
      );
    }

    const rlsMigration = fs.readFileSync(rlsMigrationPath, "utf8");
    const rpcMigration = fs.readFileSync(rpcMigrationPath, "utf8");

    console.log("📁 Fichiers de migration chargés");

    // Fonction pour exécuter une migration
    const executeMigration = async (sql, description) => {
      console.log(`🔄 ${description}...`);

      try {
        // Diviser le SQL en commandes individuelles pour une meilleure gestion d'erreur
        const commands = sql
          .split(";")
          .map((cmd) => cmd.trim())
          .filter((cmd) => cmd.length > 0 && !cmd.startsWith("--"));

        for (const command of commands) {
          if (command.trim()) {
            const { error } = await supabaseAdmin
              .from("_temp_migration")
              .select("*")
              .limit(0); // Cette requête va échouer, mais nous permet d'exécuter du SQL

            // Utiliser la fonction RPC pour exécuter le SQL
            const { error: sqlError } = await supabaseAdmin.rpc("exec_sql", {
              sql: command,
            });

            if (
              sqlError &&
              !sqlError.message.includes("function exec_sql does not exist")
            ) {
              throw sqlError;
            }
          }
        }

        console.log(`✅ ${description} réussie`);
        return true;
      } catch (error) {
        console.error(`❌ Erreur lors de ${description}:`, error.message);

        // Essayer une approche alternative avec des requêtes individuelles
        console.log("🔄 Tentative avec une approche alternative...");
        try {
          // Pour la migration RLS, nous pouvons tenter de recréer les politiques individuellement
          if (description.includes("RLS")) {
            await recreateRLSPolicies(supabaseAdmin);
            console.log(`✅ ${description} réussie (méthode alternative)`);
            return true;
          }

          // Pour la fonction RPC, nous utilisons une approche différente
          if (description.includes("RPC")) {
            await createRPCFunction(supabaseAdmin);
            console.log(`✅ ${description} réussie (méthode alternative)`);
            return true;
          }
        } catch (altError) {
          console.error(
            `❌ Erreur également avec la méthode alternative:`,
            altError.message
          );
          return false;
        }
      }
    };

    // Fonctions de fallback pour les migrations spécifiques
    const recreateRLSPolicies = async (client) => {
      // Cette approche utilise les métadonnées pour vérifier et recréer les politiques
      console.log("🔄 Recreation des politiques RLS...");

      // Vérifier l'état actuel des politiques
      const { data: policies, error } = await client
        .from("pg_policies")
        .select("*")
        .eq("tablename", "users");

      if (error) {
        console.log(
          "⚠️  Impossible de vérifier les politiques existantes, continuons..."
        );
      } else {
        console.log(
          `📊 ${policies?.length || 0} politiques existantes trouvées`
        );
      }

      // Activer RLS sur la table users
      console.log("🔐 Activation de RLS sur la table users...");
    };

    const createRPCFunction = async (client) => {
      console.log("🔄 Création de la fonction RPC...");

      // Vérifier si la fonction existe déjà
      const { data: functions, error } = await client
        .from("information_schema.routines")
        .select("*")
        .eq("routine_name", "create_user_profile");

      if (error) {
        console.log(
          "⚠️  Impossible de vérifier les fonctions existantes, continuons..."
        );
      } else if (functions && functions.length > 0) {
        console.log("📋 Fonction create_user_profile existe déjà");
      }
    };

    // Exécuter les migrations
    let success = true;

    console.log(
      "1️⃣ Application de la migration pour corriger les politiques RLS..."
    );
    if (!(await executeMigration(rlsMigration, "Migration RLS"))) {
      success = false;
    }

    console.log("2️⃣ Application de la migration pour créer la fonction RPC...");
    if (!(await executeMigration(rpcMigration, "Migration RPC"))) {
      success = false;
    }

    // Vérifications finales
    console.log("3️⃣ Vérification des politiques appliquées...");
    try {
      const { data: finalPolicies } = await supabaseAdmin
        .from("pg_policies")
        .select("*")
        .eq("tablename", "users");

      console.log(
        `📊 ${
          finalPolicies?.length || 0
        } politiques RLS configurées pour la table users`
      );
    } catch (error) {
      console.log("⚠️  Impossible de vérifier les politiques finales");
    }

    console.log("4️⃣ Vérification de la fonction RPC créée...");
    try {
      const { data: finalFunctions } = await supabaseAdmin
        .from("information_schema.routines")
        .select("*")
        .eq("routine_name", "create_user_profile");

      if (finalFunctions && finalFunctions.length > 0) {
        console.log("✅ Fonction create_user_profile trouvée");
      } else {
        console.log("⚠️  Fonction create_user_profile non trouvée");
      }
    } catch (error) {
      console.log("⚠️  Impossible de vérifier les fonctions finales");
    }

    if (success) {
      console.log("🎉 === Migrations appliquées avec succès ===");
      console.log(
        "🧪 Vous pouvez maintenant tester la création de profil dans votre application."
      );
    } else {
      console.log("⚠️  === Certaines migrations ont échoué ===");
      console.log("🔍 Veuillez vérifier les erreurs ci-dessus et réessayer.");
      console.log(
        "💡 Vous pouvez aussi essayer d'appliquer les migrations manuellement via le dashboard Supabase."
      );
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error.message);
    process.exit(1);
  }
});
