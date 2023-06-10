export const useAuth = () => {
  const isAuthenticated = async () => {
    const { data, error } = await useFetchWithBaseUrl('/api/auth/refresh');

    if (error.value) {
      return false;
    }

    if (data.value) {
        return true;
    }
}

  return { isAuthenticated };
}

