export interface AuthUser {
  id: number;
  battletag: string;
  region: string;
}

export function useAuth() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiUrl;

  const user = useState<AuthUser | null>("auth-user", () => null);
  const loading = ref(false);

  async function fetchMe() {
    try {
      const data = await $fetch<AuthUser>(`${baseUrl}/auth/me`, {
        credentials: "include",
      });
      user.value = data;
    } catch {
      user.value = null;
    }
  }

  function login(region: "eu" | "us" | "kr" = "eu") {
    window.location.href = `${baseUrl}/auth/${region}/login`;
  }

  async function logout() {
    await $fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    user.value = null;
    navigateTo("/");
  }

  return { user, loading, fetchMe, login, logout };
}
