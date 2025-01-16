export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  baseURL: API_URL,
  endpoints: {
    checkAuth: `${API_URL}/api/check-auth/`,
    login: `${API_URL}/api/login/`,
    logout: `${API_URL}/api/logout/`,
    signup: `${API_URL}/api/signup/`,
    verifyEmail: `${API_URL}/api/verify-email/`,
    resendVerification: `${API_URL}/api/resend-verification/`,
    checkSubscription: `${API_URL}/api/check-subscription/`,
    createSubscription: `${API_URL}/api/create-subscription/`,
    createCheckoutSession: `${API_URL}/api/create-checkout-session/`,
    checkPayment: `${API_URL}/api/check-payment/`,
    downloadPremium: `${API_URL}/api/download/premium/`,
    userProfile: `${API_URL}/api/user-profile/`,
    updateAvatar: `${API_URL}/api/update-avatar/`,
    toggleMfa: `${API_URL}/api/toggle-mfa/`,
    changeUsername: `${API_URL}/api/change-username/`,
    manageSubscription: `${API_URL}/api/manage-subscription/`,
    verifyLogin: `${API_URL}/api/verify-login/`,
    csrf: `${API_URL}/api/csrf/`,
  }
}; 