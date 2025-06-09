import { vi } from "vitest";

// Mock des APIs externes
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(() =>
        Promise.resolve({
          response: {
            text: () => "Réponse mockée du chatbot",
          },
        })
      ),
    })),
  })),
}));

// Mock de Google Vision AI
global.fetch = vi.fn();

// Mock de Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
      })),
    },
  })),
}));

// Mock de Nuxt
vi.mock("#app", () => ({
  useNuxtApp: vi.fn(() => ({
    $supabase: {},
    ssrContext: {},
  })),
  navigateTo: vi.fn(),
  useRoute: vi.fn(() => ({
    params: {},
    query: {},
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

// Configuration globale pour les tests
beforeEach(() => {
  vi.clearAllMocks();
});
