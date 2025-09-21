import { ComponentPublicInstance } from 'vue';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: (message: string, type?: string) => void;
  }
}

export {};
