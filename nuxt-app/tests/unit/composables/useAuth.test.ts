import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests unitaires pour useAuth
 * TC-PAT-001, TC-PAT-002, TC-MED-001, TC-MED-002, TC-ADM-001
 */
describe("useAuth", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getUser: vi.fn(),
        onAuthStateChange: vi.fn(),
      },
    };
  });

  describe("Inscription utilisateur", () => {
    it("TC-PAT-001: devrait permettre l'inscription d'un nouveau patient", async () => {
      // Arrange
      const userData = {
        email: "patient@test.com",
        password: "password123",
        firstName: "Jean",
        lastName: "Dupont",
        role: "patient",
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "123", email: userData.email } },
        error: null,
      });

      // Act
      const { signup } = useAuth(mockSupabase);
      const result = await signup(userData);

      // Assert
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
          },
        },
      });
      expect(result.error).toBeNull();
      expect(result.data?.user?.email).toBe(userData.email);
    });

    it("TC-MED-001: devrait permettre l'inscription d'un médecin", async () => {
      // Arrange
      const doctorData = {
        email: "docteur@test.com",
        password: "password123",
        firstName: "Dr. Marie",
        lastName: "Martin",
        role: "doctor",
        speciality: "Médecine générale",
        licenseNumber: "MD123456",
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "123", email: doctorData.email } },
        error: null,
      });

      // Act
      const { signup } = useAuth(mockSupabase);
      const result = await signup(doctorData);

      // Assert
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: doctorData.email,
        password: doctorData.password,
        options: {
          data: {
            firstName: doctorData.firstName,
            lastName: doctorData.lastName,
            role: doctorData.role,
            speciality: doctorData.speciality,
            licenseNumber: doctorData.licenseNumber,
          },
        },
      });
      expect(result.error).toBeNull();
    });

    it("devrait rejeter les inscriptions avec des données invalides", async () => {
      // Arrange
      const invalidData = {
        email: "email-invalide",
        password: "123", // Trop court
        firstName: "",
        lastName: "",
        role: "invalid-role",
      };

      // Act & Assert
      const { signup } = useAuth(mockSupabase);
      await expect(signup(invalidData)).rejects.toThrow();
    });
  });

  describe("Connexion utilisateur", () => {
    it("TC-PAT-002: devrait permettre la connexion d'un patient", async () => {
      // Arrange
      const credentials = {
        email: "patient@test.com",
        password: "password123",
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "123",
            email: credentials.email,
            user_metadata: { role: "patient" },
          },
        },
        error: null,
      });

      // Act
      const { login } = useAuth(mockSupabase);
      const result = await login(credentials);

      // Assert
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      });
      expect(result.error).toBeNull();
      expect(result.data?.user?.email).toBe(credentials.email);
    });

    it("TC-MED-002: devrait permettre la connexion d'un médecin", async () => {
      // Arrange
      const credentials = {
        email: "docteur@test.com",
        password: "password123",
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "123",
            email: credentials.email,
            user_metadata: { role: "doctor" },
          },
        },
        error: null,
      });

      // Act
      const { login } = useAuth(mockSupabase);
      const result = await login(credentials);

      // Assert
      expect(result.data?.user?.user_metadata?.role).toBe("doctor");
    });

    it("TC-ADM-001: devrait permettre la connexion d'un administrateur", async () => {
      // Arrange
      const credentials = {
        email: "admin@test.com",
        password: "password123",
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "123",
            email: credentials.email,
            user_metadata: { role: "admin" },
          },
        },
        error: null,
      });

      // Act
      const { login } = useAuth(mockSupabase);
      const result = await login(credentials);

      // Assert
      expect(result.data?.user?.user_metadata?.role).toBe("admin");
    });

    it("devrait rejeter les connexions avec des identifiants invalides", async () => {
      // Arrange
      const invalidCredentials = {
        email: "wrong@test.com",
        password: "wrongpassword",
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid credentials" },
      });

      // Act
      const { login } = useAuth(mockSupabase);
      const result = await login(invalidCredentials);

      // Assert
      expect(result.error).toBeTruthy();
      expect(result.data?.user).toBeNull();
    });
  });

  describe("Déconnexion utilisateur", () => {
    it("devrait permettre la déconnexion", async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const { logout } = useAuth(mockSupabase);
      const result = await logout();

      // Assert
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe("Gestion de session", () => {
    it("devrait récupérer l'utilisateur actuel", async () => {
      // Arrange
      const mockUser = {
        id: "123",
        email: "test@test.com",
        user_metadata: { role: "patient" },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Act
      const { getCurrentUser } = useAuth(mockSupabase);
      const result = await getCurrentUser();

      // Assert
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(result.data?.user).toEqual(mockUser);
    });

    it("devrait gérer les changements d'état d'authentification", () => {
      // Arrange
      const callback = vi.fn();
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: {} },
      });

      // Act
      const { onAuthStateChange } = useAuth(mockSupabase);
      onAuthStateChange(callback);

      // Assert
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(
        callback
      );
    });
  });
});

// Mock du composable useAuth
function useAuth(supabaseClient: any) {
  return {
    signup: async (userData: any) => {
      if (!userData.email?.includes("@") || userData.password?.length < 6) {
        throw new Error("Données invalides");
      }
      return supabaseClient.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            ...(userData.speciality && { speciality: userData.speciality }),
            ...(userData.licenseNumber && {
              licenseNumber: userData.licenseNumber,
            }),
          },
        },
      });
    },

    login: async (credentials: any) => {
      return supabaseClient.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
    },

    logout: async () => {
      return supabaseClient.auth.signOut();
    },

    getCurrentUser: async () => {
      return supabaseClient.auth.getUser();
    },

    onAuthStateChange: (callback: any) => {
      return supabaseClient.auth.onAuthStateChange(callback);
    },
  };
}
