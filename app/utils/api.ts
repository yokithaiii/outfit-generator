export const useApi = () => {
  const config = useRuntimeConfig()
  const { getToken, clearAuthData } = useAuth()

  const token = getToken()
  
  const api = $fetch.create({
    baseURL: config.public.apiBase,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        clearAuthData()
        navigateTo('/auth/login')
      }
    }
  })

  return api
}