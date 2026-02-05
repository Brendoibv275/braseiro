import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Debug para verificar se as variáveis estão sendo carregadas
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'Definida' : 'Indefinida',
  projectId: firebaseConfig.projectId || 'Indefinido',
});

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('ERRO CRÍTICO: Variáveis de ambiente do Firebase não encontradas!');
  throw new Error('Firebase API Key and Project ID are required.');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
