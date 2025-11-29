export function useAuth() {
  return {
    user: { name: "User", email: "user@example.com" },
    isAuthenticated: true,
    loading: false,
    logout: () => {},
  };
}