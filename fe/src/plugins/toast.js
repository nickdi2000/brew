import { createApp, inject } from 'vue';
import Toast from '../components/Toast.vue';

// Create a symbol for the toast injection key
const TOAST_KEY = Symbol('toast');

export const toast = {
  install: (app) => {
    // Create a new div for mounting the toast component
    const toastContainer = document.createElement('div');
    document.body.appendChild(toastContainer);

    // Create a new instance of the Toast component
    const toastApp = createApp(Toast);
    const toastInstance = toastApp.mount(toastContainer);

    // Create the toast function
    const toastFn = (message, type = 'info', duration = 3000) => {
      toastInstance.addToast(message, type, duration);
    };

    // Add the $toast method to the global Vue instance
    app.config.globalProperties.$toast = toastFn;

    // Also provide it through the inject/provide system
    app.provide(TOAST_KEY, toastFn);
  }
};

// Export the useToast composable
export const useToast = () => {
  const toast = inject(TOAST_KEY);
  if (!toast) {
    throw new Error('Toast plugin not installed!');
  }
  return toast;
};
