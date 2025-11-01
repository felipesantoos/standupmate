/**
 * Environment Configuration
 * 
 * Type-safe environment variables.
 * Following Colabora pattern for environment config.
 */

interface EnvironmentConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  environment: 'development' | 'production' | 'test';
  useAPI: boolean; // Toggle between SQLite and HTTP API
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

export const env: EnvironmentConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080'),
  apiTimeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '10000'), 10),
  environment: (getEnvVar('VITE_ENVIRONMENT', 'development') as any),
  useAPI: getEnvVar('VITE_USE_API', 'false') === 'true', // false = SQLite, true = HTTP API
};

// Validate environment
if (!['development', 'production', 'test'].includes(env.environment)) {
  console.warn(`Invalid environment: ${env.environment}, defaulting to development`);
}

