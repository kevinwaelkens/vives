import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Language data
const languages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    isActive: true,
    isDefault: true,
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    isActive: true,
    isDefault: false,
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    isActive: true,
    isDefault: false,
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    isActive: true,
    isDefault: false,
  },
  {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱",
    isActive: true,
    isDefault: false,
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    isActive: true,
    isDefault: false,
  },
];

// Translation keys with English text and translations
const translationData = [
  // Authentication
  {
    key: "auth.login.title",
    englishText: "Login",
    description: "Login page title",
    category: "auth",
    translations: {
      fr: "Connexion",
      de: "Anmelden",
      it: "Accedi",
      nl: "Inloggen",
      es: "Iniciar sesión",
    },
  },
  {
    key: "auth.login.email",
    englishText: "Email",
    description: "Email field label",
    category: "auth",
    translations: {
      fr: "E-mail",
      de: "E-Mail",
      it: "Email",
      nl: "E-mail",
      es: "Correo electrónico",
    },
  },
  {
    key: "auth.login.password",
    englishText: "Password",
    description: "Password field label",
    category: "auth",
    translations: {
      fr: "Mot de passe",
      de: "Passwort",
      it: "Password",
      nl: "Wachtwoord",
      es: "Contraseña",
    },
  },
  {
    key: "auth.login.submit",
    englishText: "Sign In",
    description: "Login submit button",
    category: "auth",
    translations: {
      fr: "Se connecter",
      de: "Anmelden",
      it: "Accedi",
      nl: "Inloggen",
      es: "Iniciar sesión",
    },
  },
  {
    key: "auth.logout",
    englishText: "Logout",
    description: "Logout button",
    category: "auth",
    translations: {
      fr: "Déconnexion",
      de: "Abmelden",
      it: "Esci",
      nl: "Uitloggen",
      es: "Cerrar sesión",
    },
  },

  // Navigation
  {
    key: "navigation.dashboard",
    englishText: "Dashboard",
    description: "Dashboard navigation item",
    category: "navigation",
    translations: {
      fr: "Tableau de bord",
      de: "Dashboard",
      it: "Dashboard",
      nl: "Dashboard",
      es: "Panel de control",
    },
  },
  {
    key: "navigation.students",
    englishText: "Students",
    description: "Students navigation item",
    category: "navigation",
    translations: {
      fr: "Étudiants",
      de: "Studenten",
      it: "Studenti",
      nl: "Studenten",
      es: "Estudiantes",
    },
  },
  {
    key: "navigation.groups",
    englishText: "Groups",
    description: "Groups navigation item",
    category: "navigation",
    translations: {
      fr: "Groupes",
      de: "Gruppen",
      it: "Gruppi",
      nl: "Groepen",
      es: "Grupos",
    },
  },
  {
    key: "navigation.tasks",
    englishText: "Tasks",
    description: "Tasks navigation item",
    category: "navigation",
    translations: {
      fr: "Tâches",
      de: "Aufgaben",
      it: "Compiti",
      nl: "Taken",
      es: "Tareas",
    },
  },
  {
    key: "navigation.assessments",
    englishText: "Assessments",
    description: "Assessments navigation item",
    category: "navigation",
    translations: {
      fr: "Évaluations",
      de: "Bewertungen",
      it: "Valutazioni",
      nl: "Beoordelingen",
      es: "Evaluaciones",
    },
  },
  {
    key: "navigation.attendance",
    englishText: "Attendance",
    description: "Attendance navigation item",
    category: "navigation",
    translations: {
      fr: "Présence",
      de: "Anwesenheit",
      it: "Presenza",
      nl: "Aanwezigheid",
      es: "Asistencia",
    },
  },
  {
    key: "navigation.analytics",
    englishText: "Analytics",
    description: "Analytics navigation item",
    category: "navigation",
    translations: {
      fr: "Analyses",
      de: "Analytik",
      it: "Analisi",
      nl: "Analytics",
      es: "Análisis",
    },
  },
  {
    key: "navigation.settings",
    englishText: "Settings",
    description: "Settings navigation item",
    category: "navigation",
    translations: {
      fr: "Paramètres",
      de: "Einstellungen",
      it: "Impostazioni",
      nl: "Instellingen",
      es: "Configuración",
    },
  },

  // Dashboard
  {
    key: "dashboard.welcome",
    englishText: "Welcome to School Management System",
    description: "Dashboard welcome message",
    category: "dashboard",
    translations: {
      fr: "Bienvenue dans le système de gestion scolaire",
      de: "Willkommen im Schulverwaltungssystem",
      it: "Benvenuto nel sistema di gestione scolastica",
      nl: "Welkom bij het schoolbeheersysteem",
      es: "Bienvenido al sistema de gestión escolar",
    },
  },
  {
    key: "dashboard.overview",
    englishText: "Overview",
    description: "Dashboard overview section",
    category: "dashboard",
    translations: {
      fr: "Aperçu",
      de: "Übersicht",
      it: "Panoramica",
      nl: "Overzicht",
      es: "Resumen",
    },
  },
  {
    key: "dashboard.statistics",
    englishText: "Statistics",
    description: "Dashboard statistics section",
    category: "dashboard",
    translations: {
      fr: "Statistiques",
      de: "Statistiken",
      it: "Statistiche",
      nl: "Statistieken",
      es: "Estadísticas",
    },
  },
  {
    key: "dashboard.recent_activity",
    englishText: "Recent Activity",
    description: "Dashboard recent activity section",
    category: "dashboard",
    translations: {
      fr: "Activité récente",
      de: "Letzte Aktivität",
      it: "Attività recente",
      nl: "Recente activiteit",
      es: "Actividad reciente",
    },
  },

  // Common actions
  {
    key: "common.save",
    englishText: "Save",
    description: "Save button",
    category: "common",
    translations: {
      fr: "Enregistrer",
      de: "Speichern",
      it: "Salva",
      nl: "Opslaan",
      es: "Guardar",
    },
  },
  {
    key: "common.cancel",
    englishText: "Cancel",
    description: "Cancel button",
    category: "common",
    translations: {
      fr: "Annuler",
      de: "Abbrechen",
      it: "Annulla",
      nl: "Annuleren",
      es: "Cancelar",
    },
  },
  {
    key: "common.delete",
    englishText: "Delete",
    description: "Delete button",
    category: "common",
    translations: {
      fr: "Supprimer",
      de: "Löschen",
      it: "Elimina",
      nl: "Verwijderen",
      es: "Eliminar",
    },
  },
  {
    key: "common.edit",
    englishText: "Edit",
    description: "Edit button",
    category: "common",
    translations: {
      fr: "Modifier",
      de: "Bearbeiten",
      it: "Modifica",
      nl: "Bewerken",
      es: "Editar",
    },
  },
  {
    key: "common.view",
    englishText: "View",
    description: "View button",
    category: "common",
    translations: {
      fr: "Voir",
      de: "Anzeigen",
      it: "Visualizza",
      nl: "Bekijken",
      es: "Ver",
    },
  },
  {
    key: "common.loading",
    englishText: "Loading...",
    description: "Loading message",
    category: "common",
    translations: {
      fr: "Chargement...",
      de: "Laden...",
      it: "Caricamento...",
      nl: "Laden...",
      es: "Cargando...",
    },
  },
  {
    key: "common.error",
    englishText: "Error",
    description: "Error message",
    category: "common",
    translations: {
      fr: "Erreur",
      de: "Fehler",
      it: "Errore",
      nl: "Fout",
      es: "Error",
    },
  },
  {
    key: "common.success",
    englishText: "Success",
    description: "Success message",
    category: "common",
    translations: {
      fr: "Succès",
      de: "Erfolg",
      it: "Successo",
      nl: "Succes",
      es: "Éxito",
    },
  },

  // Forms
  {
    key: "forms.required_field",
    englishText: "This field is required",
    description: "Required field validation message",
    category: "forms",
    translations: {
      fr: "Ce champ est obligatoire",
      de: "Dieses Feld ist erforderlich",
      it: "Questo campo è obbligatorio",
      nl: "Dit veld is verplicht",
      es: "Este campo es obligatorio",
    },
  },
  {
    key: "forms.invalid_email",
    englishText: "Invalid email address",
    description: "Invalid email validation message",
    category: "forms",
    translations: {
      fr: "Adresse e-mail invalide",
      de: "Ungültige E-Mail-Adresse",
      it: "Indirizzo email non valido",
      nl: "Ongeldig e-mailadres",
      es: "Dirección de correo electrónico inválida",
    },
  },

  // CMS
  {
    key: "cms.title",
    englishText: "Content Management System",
    description: "CMS page title",
    category: "cms",
    translations: {
      fr: "Système de gestion de contenu",
      de: "Content-Management-System",
      it: "Sistema di gestione dei contenuti",
      nl: "Contentmanagementsysteem",
      es: "Sistema de gestión de contenidos",
    },
  },
  {
    key: "cms.user_management",
    englishText: "User Management",
    description: "CMS user management section",
    category: "cms",
    translations: {
      fr: "Gestion des utilisateurs",
      de: "Benutzerverwaltung",
      it: "Gestione utenti",
      nl: "Gebruikersbeheer",
      es: "Gestión de usuarios",
    },
  },
  {
    key: "cms.system_settings",
    englishText: "System Settings",
    description: "CMS system settings section",
    category: "cms",
    translations: {
      fr: "Paramètres système",
      de: "Systemeinstellungen",
      it: "Impostazioni di sistema",
      nl: "Systeeminstellingen",
      es: "Configuración del sistema",
    },
  },
  {
    key: "cms.translations",
    englishText: "Translations",
    description: "CMS translations section",
    category: "cms",
    translations: {
      fr: "Traductions",
      de: "Übersetzungen",
      it: "Traduzioni",
      nl: "Vertalingen",
      es: "Traducciones",
    },
  },
];

async function seedTranslations() {
  console.log("🌍 Seeding translation system...");

  // Create languages
  console.log("Creating languages...");
  const createdLanguages = new Map();

  for (const langData of languages) {
    const language = await prisma.language.upsert({
      where: { code: langData.code },
      update: langData,
      create: langData,
    });
    createdLanguages.set(langData.code, language);
    console.log(`✓ Language: ${language.name} (${language.code})`);
  }

  // Create translation keys and translations
  console.log("Creating translation keys and translations...");

  for (const data of translationData) {
    // Create translation key
    const translationKey = await prisma.translationKey.upsert({
      where: { key: data.key },
      update: {
        englishText: data.englishText,
        description: data.description,
        category: data.category,
      },
      create: {
        key: data.key,
        englishText: data.englishText,
        description: data.description,
        category: data.category,
      },
    });

    // Create English translation (from englishText)
    const englishLang = createdLanguages.get("en");
    if (englishLang) {
      await prisma.translation.upsert({
        where: {
          translationKeyId_languageId: {
            translationKeyId: translationKey.id,
            languageId: englishLang.id,
          },
        },
        update: {
          text: data.englishText,
          isApproved: true,
        },
        create: {
          translationKeyId: translationKey.id,
          languageId: englishLang.id,
          text: data.englishText,
          isApproved: true,
        },
      });
    }

    // Create translations for other languages
    for (const [langCode, translationText] of Object.entries(
      data.translations,
    )) {
      const language = createdLanguages.get(langCode);
      if (language) {
        await prisma.translation.upsert({
          where: {
            translationKeyId_languageId: {
              translationKeyId: translationKey.id,
              languageId: language.id,
            },
          },
          update: {
            text: translationText,
            isApproved: true,
          },
          create: {
            translationKeyId: translationKey.id,
            languageId: language.id,
            text: translationText,
            isApproved: true,
          },
        });
      }
    }

    console.log(`✓ Translation key: ${data.key}`);
  }

  console.log("🎉 Translation system seeded successfully!");
  console.log(
    `📊 Created ${languages.length} languages and ${translationData.length} translation keys`,
  );
}

export default seedTranslations;

// Allow running this file directly
if (require.main === module) {
  seedTranslations()
    .catch((e) => {
      console.error("Error seeding translations:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
