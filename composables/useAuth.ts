export async function useAuth() {
    const { data, error } = await useFetchWithBaseUrl('/api/auth/refresh');
    return error.value ? false : data.value ? true : false;
}

