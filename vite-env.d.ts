interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly PROD?: boolean;
  readonly BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type SerialPort = unknown;

interface BluetoothDevice {
  name?: string;
  gatt?: {
    connect: () => Promise<unknown>;
  };
}