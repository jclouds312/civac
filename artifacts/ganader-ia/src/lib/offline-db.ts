/**
 * Base de datos offline local - IndexedDB wrapper
 * Funciona 100% sin conexión
 * Se sincroniza cuando hay conexión disponible
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

interface OfflineDBSchema extends DBSchema {
  animals: {
    key: string;
    value: {
      id: string;
      name: string;
      race: string;
      weight: number;
      age: number;
      healthStatus: string;
      lastUpdated: number;
      synced: boolean;
    };
    indexes: { "by-race": string; "by-status": string };
  };
  potreros: {
    key: string;
    value: {
      id: string;
      name: string;
      hectares: number;
      animals: string[];
      condition: "excellent" | "good" | "fair" | "poor";
      lastUpdated: number;
    };
  };
  insumos: {
    key: string;
    value: {
      id: string;
      name: string;
      quantity: number;
      unit: string;
      expiryDate: number;
      category: string;
      lastUpdated: number;
    };
  };
  pesajes: {
    key: string;
    value: {
      id: string;
      animalId: string;
      weight: number;
      date: number;
      location: string;
      synced: boolean;
    };
    indexes: { "by-animal": string; "by-date": string };
  };
  alertas: {
    key: string;
    value: {
      id: string;
      type: "health" | "production" | "reproduction" | "management";
      severity: "critical" | "high" | "medium" | "low";
      animalId: string;
      message: string;
      created: number;
      resolved: boolean;
    };
    indexes: { "by-severity": string; "by-type": string };
  };
  gps: {
    key: string;
    value: {
      id: string;
      animalId: string;
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: number;
      synced: boolean;
    };
    indexes: { "by-animal": string };
  };
  usuarios: {
    key: string;
    value: {
      id: string;
      email: string;
      role: string;
      plan: "Basic" | "Professional" | "Enterprise" | "Developer";
      lastLogin: number;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      operation: "CREATE" | "UPDATE" | "DELETE";
      table: string;
      data: any;
      timestamp: number;
      attempts: number;
    };
  };
}

/**
 * Wrapper de base de datos offline
 */
export class OfflineDatabase {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;
  private isOnline = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    this.db = await openDB<OfflineDBSchema>("civac-offline", 1, {
      upgrade(db) {
        // Tabla de animales
        if (!db.objectStoreNames.contains("animals")) {
          const animalStore = db.createObjectStore("animals", { keyPath: "id" });
          animalStore.createIndex("by-race", "race");
          animalStore.createIndex("by-status", "healthStatus");
        }

        // Tabla de potreros
        if (!db.objectStoreNames.contains("potreros")) {
          db.createObjectStore("potreros", { keyPath: "id" });
        }

        // Tabla de insumos
        if (!db.objectStoreNames.contains("insumos")) {
          db.createObjectStore("insumos", { keyPath: "id" });
        }

        // Tabla de pesajes
        if (!db.objectStoreNames.contains("pesajes")) {
          const pesajeStore = db.createObjectStore("pesajes", { keyPath: "id" });
          pesajeStore.createIndex("by-animal", "animalId");
          pesajeStore.createIndex("by-date", "date");
        }

        // Tabla de alertas
        if (!db.objectStoreNames.contains("alertas")) {
          const alertaStore = db.createObjectStore("alertas", { keyPath: "id" });
          alertaStore.createIndex("by-severity", "severity");
          alertaStore.createIndex("by-type", "type");
        }

        // Tabla de GPS
        if (!db.objectStoreNames.contains("gps")) {
          const gpsStore = db.createObjectStore("gps", { keyPath: "id" });
          gpsStore.createIndex("by-animal", "animalId");
        }

        // Tabla de usuarios
        if (!db.objectStoreNames.contains("usuarios")) {
          db.createObjectStore("usuarios", { keyPath: "id" });
        }

        // Cola de sincronización
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", { keyPath: "id" });
        }
      },
    });

    // Monitorear conexión
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncWithServer();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });

    console.log("✅ Offline database initialized");
  }

  /**
   * Agregar o actualizar animal
   */
  async upsertAnimal(animal: OfflineDBSchema["animals"]["value"]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("animals", "readwrite");
    await tx.store.put(animal);

    if (!this.isOnline) {
      await this.queueSync("UPDATE", "animals", animal);
    }
  }

  /**
   * Obtener animales con filtros
   */
  async getAnimals(filter?: {
    race?: string;
    status?: string;
  }): Promise<OfflineDBSchema["animals"]["value"][]> {
    if (!this.db) throw new Error("Database not initialized");

    if (!filter) {
      return this.db.getAll("animals");
    }

    let results = await this.db.getAll("animals");

    if (filter.race) {
      results = results.filter((a) => a.race === filter.race);
    }

    if (filter.status) {
      results = results.filter((a) => a.healthStatus === filter.status);
    }

    return results;
  }

  /**
   * Registrar pesaje
   */
  async recordWeighting(pesaje: OfflineDBSchema["pesajes"]["value"]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const tx = this.db.transaction("pesajes", "readwrite");
    await tx.store.add(pesaje);

    if (!this.isOnline) {
      await this.queueSync("CREATE", "pesajes", pesaje);
    }
  }

  /**
   * Obtener pesajes de un animal
   */
  async getWeightHistory(animalId: string, days: number = 30) {
    if (!this.db) throw new Error("Database not initialized");

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const allPesajes = await this.db.getAllFromIndex(
      "pesajes",
      "by-animal",
      animalId
    );

    return allPesajes.filter((p) => p.date > cutoff);
  }

  /**
   * Registrar alerta
   */
  async createAlert(
    alert: OfflineDBSchema["alertas"]["value"]
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const tx = this.db.transaction("alertas", "readwrite");
    await tx.store.add(alert);

    if (!this.isOnline) {
      await this.queueSync("CREATE", "alertas", alert);
    }
  }

  /**
   * Obtener alertas pendientes
   */
  async getUnresolvedAlerts(): Promise<OfflineDBSchema["alertas"]["value"][]> {
    if (!this.db) throw new Error("Database not initialized");

    const allAlerts = await this.db.getAll("alertas");
    return allAlerts.filter((a) => !a.resolved);
  }

  /**
   * Registrar posición GPS
   */
  async recordGPS(gps: OfflineDBSchema["gps"]["value"]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const tx = this.db.transaction("gps", "readwrite");
    await tx.store.add(gps);

    if (!this.isOnline) {
      await this.queueSync("CREATE", "gps", gps);
    }
  }

  /**
   * Cola de sincronización (para cuando no hay conexión)
   */
  private async queueSync(
    operation: "CREATE" | "UPDATE" | "DELETE",
    table: string,
    data: any
  ): Promise<void> {
    if (!this.db) return;

    const queueItem: OfflineDBSchema["syncQueue"]["value"] = {
      id: `${table}-${Date.now()}-${Math.random()}`,
      operation,
      table,
      data,
      timestamp: Date.now(),
      attempts: 0,
    };

    const tx = this.db.transaction("syncQueue", "readwrite");
    await tx.store.add(queueItem);
  }

  /**
   * Sincronizar con servidor cuando hay conexión
   */
  private async syncWithServer(): Promise<void> {
    if (!this.db) return;

    const queue = await this.db.getAll("syncQueue");

    for (const item of queue) {
      try {
        // Enviar a servidor
        await fetch(`/api/${item.table}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: item.operation,
            data: item.data,
          }),
        });

        // Remover de cola
        const tx = this.db.transaction("syncQueue", "readwrite");
        await tx.store.delete(item.id);
      } catch (error) {
        // Reintentar luego
        item.attempts++;
        if (item.attempts < 3) {
          const tx = this.db.transaction("syncQueue", "readwrite");
          await tx.store.put(item);
        }
      }
    }
  }

  /**
   * Obtener estadísticas de la BD
   */
  async getStats() {
    if (!this.db) throw new Error("Database not initialized");

    return {
      animals: await this.db.count("animals"),
      potreros: await this.db.count("potreros"),
      pesajes: await this.db.count("pesajes"),
      alertas: await this.db.count("alertas"),
      gps: await this.db.count("gps"),
      syncPending: await this.db.count("syncQueue"),
      isOnline: this.isOnline,
    };
  }

  /**
   * Limpiar base de datos
   */
  async clear(): Promise<void> {
    if (!this.db) return;

    for (const storeName of [
      "animals",
      "potreros",
      "insumos",
      "pesajes",
      "alertas",
      "gps",
      "usuarios",
      "syncQueue",
    ]) {
      const tx = this.db.transaction(storeName, "readwrite");
      await tx.store.clear();
    }
  }
}

// Singleton global
let offlineDb: OfflineDatabase | null = null;

export async function getOfflineDatabase(): Promise<OfflineDatabase> {
  if (!offlineDb) {
    offlineDb = new OfflineDatabase();
    await offlineDb.initialize();
  }
  return offlineDb;
}
