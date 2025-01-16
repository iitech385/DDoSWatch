export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Function to get CSRF token from cookies
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Default fetch options
export const defaultOptions = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCsrfToken() || '',
  },
};

export const api = {
  baseURL: API_URL,
  endpoints: {
    csrf: `${API_URL}/api/csrf/`,
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
  }
}; 