import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';

export interface ScaleSystemConfig {
  // TIPOS DE COMUNICACIÓN
  tiposComun: {
    serial: boolean;
    bt: boolean;
    wifi: boolean;
  };
  // DIGITAL WEIGHT INDICATOR
  indicador: {
    modelo: string;
    puerto: string;
    velocidadBaud: number;
    parametros: string; // Ej: "8,N,1"
    intervaloInterrogacion: number; // ms
  };
  // PRESIONES EN LA TECLA
  presiones: {
    teclaEspecial: string; // Tecla configurada
    accionContinua: boolean; // Permitir pesaje continuo
  };
  // NUMERACIÓN DE CONSECUTIVOS
  numeracion: {
    numeroPlantilla: number;
    consecutivoNumeracion: number;
    intervalHistorico: number; // Segundos entre registros
  };
  // AJUSTE DE IMPRESIÓN / ETIQUETA
  ajusteImpresion: {
    ajusteVertical: string; // Ej: "0.6"
    ajusteHorizontal: string; // Ej: "0.5"
    tiqueDeEtiqueta: boolean;
  };
  // DATOS DE LA EMPRESA
  empresa: {
    nombre: string;
    nit: string;
    ciudad: string;
    telefono: string;
    producto: string;
  };
}

const DEFAULT_CONFIG: ScaleSystemConfig = {
  tiposComun: { serial: true, bt: true, wifi: false },
  indicador: {
    modelo: 'PROMETAL-GCS-A',
    puerto: 'COM3',
    velocidadBaud: 9600,
    parametros: '8,N,1',
    intervaloInterrogacion: 100,
  },
  presiones: {
    teclaEspecial: '#',
    accionContinua: true,
  },
  numeracion: {
    numeroPlantilla: 2,
    consecutivoNumeracion: 0,
    intervalHistorico: 60,
  },
  ajusteImpresion: {
    ajusteVertical: '0.6',
    ajusteHorizontal: '0.5',
    tiqueDeEtiqueta: true,
  },
  empresa: {
    nombre: 'HACIENDA GANADERA LA COROCORA',
    nit: '801203002',
    ciudad: 'BOGOTÁ',
    telefono: '2251510',
    producto: 'SDRS-2004/07/30',
  },
};

interface ScaleConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: ScaleSystemConfig) => void;
  currentConfig?: ScaleSystemConfig;
}

export const ScaleConfigModal: React.FC<ScaleConfigModalProps> = ({
  open,
  onClose,
  onSave,
  currentConfig,
}) => {
  const [config, setConfig] = useState<ScaleSystemConfig>(currentConfig || DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'comun' | 'indicador' | 'presiones' | 'numeracion' | 'impresion' | 'empresa'>(
    'comun'
  );

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
    }
  }, [currentConfig, open]);

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a4a2e] to-[#2d6a4f] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">CONFIGURACIÓN DEL SISTEMA DE BÁSCULAS</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 pt-4">
          {[
            { id: 'comun' as const, label: 'Tipos de Comunicación' },
            { id: 'indicador' as const, label: 'Indicador Digital' },
            { id: 'presiones' as const, label: 'Presiones' },
            { id: 'numeracion' as const, label: 'Numeración' },
            { id: 'impresion' as const, label: 'Impresión' },
            { id: 'empresa' as const, label: 'Empresa' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#1a4a2e] text-[#1a4a2e]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'comun' && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#1a4a2e]">SELECCIONAR TIPOS DE COMUNICACIÓN</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'serial' as const, label: 'PUERTO SERIAL' },
                  { key: 'bt' as const, label: 'BLUETOOTH' },
                  { key: 'wifi' as const, label: 'WIFI' },
                ].map(type => (
                  <label
                    key={type.key}
                    className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: config.tiposComun[type.key] ? '#1a4a2e' : '#e5e7eb',
                      backgroundColor: config.tiposComun[type.key] ? 'rgba(26,74,46,0.05)' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={config.tiposComun[type.key]}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          tiposComun: { ...prev.tiposComun, [type.key]: e.target.checked },
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'indicador' && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#1a4a2e]">INDICADOR DIGITAL DE PESO - PROMETAL CGA-CS A</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Punto de Conexión Serial</label>
                  <input
                    type="text"
                    value={config.indicador.puerto}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      indicador: { ...prev.indicador, puerto: e.target.value },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Velocidad (Baud)</label>
                  <input
                    type="number"
                    value={config.indicador.velocidadBaud}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      indicador: { ...prev.indicador, velocidadBaud: parseInt(e.target.value) },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Parámetros (8,N,1)</label>
                  <input
                    type="text"
                    value={config.indicador.parametros}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      indicador: { ...prev.indicador, parametros: e.target.value },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Intervalo Interrogación (ms)</label>
                  <input
                    type="number"
                    value={config.indicador.intervaloInterrogacion}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      indicador: { ...prev.indicador, intervaloInterrogacion: parseInt(e.target.value) },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presiones' && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#1a4a2e]">PRESIONES EN LA TECLA DEL INDICADOR</h3>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Tecla Especial para Acción</label>
                <select
                  value={config.presiones.teclaEspecial}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    presiones: { ...prev.presiones, teclaEspecial: e.target.value },
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="#"># (Numeral)</option>
                  <option value="*">* (Asterisco)</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                </select>
              </div>
              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.presiones.accionContinua}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      presiones: { ...prev.presiones, accionContinua: e.target.checked },
                    }))
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  Permitir pesaje continuo (presionar numeral para continuar sin dejar anterior)
                </span>
              </label>
            </div>
          )}

          {activeTab === 'numeracion' && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#1a4a2e]">NUMERACIÓN DE CONSECUTIVOS</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Número de Plantilla</label>
                  <input
                    type="number"
                    value={config.numeracion.numeroPlantilla}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      numeracion: { ...prev.numeracion, numeroPlantilla: parseInt(e.target.value) },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Consecutivo Numeración</label>
                  <input
                    type="number"
                    value={config.numeracion.consecutivoNumeracion}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      numeracion: { ...prev.numeracion, consecutivoNumeracion: parseInt(e.target.value) },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Intervalo Histórico (segundos)</label>
                  <input
                    type="number"
                    value={config.numeracion.intervalHistorico}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      numeracion: { ...prev.numeracion, intervalHistorico: parseInt(e.target.value) },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'impresion' && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#1a4a2e]">AJUSTE IMPRESIÓN / ETIQUETA DE PESO</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Ajuste Vertical (0.0-1.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.ajusteImpresion.ajusteVertical}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      ajusteImpresion: { ...prev.ajusteImpresion, ajusteVertical: e.target.value },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Ajuste Horizontal (0.0-1.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.ajusteImpresion.ajusteHorizontal}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      ajusteImpresion: { ...prev.ajusteImpresion, ajusteHorizontal: e.target.value },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.ajusteImpresion.tiqueDeEtiqueta}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      ajusteImpresion: { ...prev.ajusteImpresion, tiqueDeEtiqueta: e.target.checked },
                    }))
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Habilitar tique de etiqueta</span>
              </label>
            </div>
          )}

          {activeTab === 'empresa' && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#1a4a2e]">DATOS DE LA EMPRESA</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={config.empresa.nombre}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      empresa: { ...prev.empresa, nombre: e.target.value },
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">NIT</label>
                    <input
                      type="text"
                      value={config.empresa.nit}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        empresa: { ...prev.empresa, nit: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={config.empresa.ciudad}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        empresa: { ...prev.empresa, ciudad: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={config.empresa.telefono}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        empresa: { ...prev.empresa, telefono: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Producto</label>
                    <input
                      type="text"
                      value={config.empresa.producto}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        empresa: { ...prev.empresa, producto: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RotateCcw size={16} />
            Restaurar Valores Por Defecto
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a4a2e] text-white rounded-lg hover:bg-[#0f3620] transition-colors"
          >
            <Save size={16} />
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
