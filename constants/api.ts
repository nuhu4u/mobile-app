// API constants
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.194:3001/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyOtp: '/auth/verify-otp',
    changePassword: '/auth/change-password',
    me: '/auth/me',
  },
  elections: {
    list: '/elections',
    create: '/elections',
    get: '/elections',
    update: '/elections',
    delete: '/elections',
    results: '/elections',
    vote: '/elections',
  },
  blockchain: {
    transaction: '/blockchain/transaction',
    verify: '/blockchain/verify',
    status: '/blockchain/status',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;
