import Config from 'react-native-config';

export const ENV = {
  environment: Config.ENV || 'development',
  apiUrl: Config.API_URL || '',
  firebase: {
    apiKey: Config.FIREBASE_API_KEY || '',
    authDomain: Config.FIREBASE_AUTH_DOMAIN || '',
    projectId: Config.FIREBASE_PROJECT_ID || '',
    storageBucket: Config.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: Config.FIREBASE_APP_ID || '',
  },
};

export const isDevelopment = ENV.environment === 'development';
export const isStaging = ENV.environment === 'staging';
export const isProduction = ENV.environment === 'production';
