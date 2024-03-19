export async function useAuth() {
    const { data } = await useFetchWithBaseUrl('/api/auth/refresh');

    if (data?.value?.message === 'refreshed') {
        return true;
    } else {
        return false;
    }
}

