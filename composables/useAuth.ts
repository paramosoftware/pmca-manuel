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

    const isAdmin = async () => {
        const { data, error } = await useFetchWithBaseUrl('/api/auth/isadmin');

        if (error.value) {
            return false;
        }

        if (data.value) {
            return data.value;
        }
    }

    return { isAuthenticated, isAdmin };
}

