declare module 'vue-qrcode' {
  import { DefineComponent } from 'vue';
  const QrcodeVue: DefineComponent<{
    value: string;
    size?: number;
    level?: string;
    background?: string;
    foreground?: string;
    className?: string;
  }>;
  export default QrcodeVue;
}
