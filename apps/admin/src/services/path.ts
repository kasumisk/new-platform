const PATH = {
  FILE_S3: '/file/image/create',
  USER_ADMIN: {
    LOGIN_BY_TOKEN: '/auth/login_by_token',
    AUTHEN_SEND_CODE: '/auth/send_code',
    AUTHEN_LOGIN: '/auth/login',
    INFO: '/auth/info',
  },
  ADMIN: {
    USERS: '/admin/users',
    CLIENTS: '/admin/clients',
    CAPABILITIES: '/admin/capabilities',
    PERMISSIONS: '/admin/permissions',
    PROVIDERS: '/admin/providers',
    ANALYTICS: '/admin/analytics',
    MODELS: '/admin/models',
    // RBAC 权限管理
    ROLES: '/admin/roles',
    RBAC_PERMISSIONS: '/admin/rbac-permissions',
    PERMISSION_TEMPLATES: '/admin/permission-templates',
    // 应用版本管理
    APP_VERSIONS: '/admin/app-versions',
    // App 用户管理
    APP_USERS: '/admin/app-users',
  },
};

export { PATH };
