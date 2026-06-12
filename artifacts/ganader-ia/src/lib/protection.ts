/**
 * CIVAC PRO — Sistema de Protección Intelectual
 * Anti-phishing · Anti-copia · Licencia SoftGan Colombia
 * Propietario: Johnatan Vallejo Marulanda
 * © Universal Business Technology — Todos los derechos reservados
 */

export const CIVAC_LICENSE = {
  producto:    'CIVAC PRO — Control Inteligente de Valor Agropecuario',
  version:     'v7.0',
  propietario: 'Johnatan Vallejo Marulanda',
  empresa:     'Universal Business Technology',
  licenciante: 'SoftGan Colombia',
  marca:       'CIVAC®',
  sitio:       'https://civac.pro',
  soporte:     'soporte@softgan.com.co',
  año:         2026,
};

const DOMINIOS_AUTORIZADOS = [
  'localhost',
  '127.0.0.1',
  'civac.pro',
  'ganader.ia',
  'ganader-ia',
  'ganaderia',
  'replit.dev',
  'replit.app',
  'repl.co',
  'replit.co',
];

/** Verifica si el dominio actual está autorizado */
export function isDomainAuthorized(): boolean {
  const host = window.location.hostname.toLowerCase();
  return DOMINIOS_AUTORIZADOS.some(d => host.includes(d));
}

/** Genera un fingerprint único de la instancia */
export function getInstanceFingerprint(): string {
  const key = 'civac_instance_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `CIVAC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

/** Agrega marca de agua invisible al documento */
export function applyWatermark(): void {
  const existing = document.getElementById('civac-watermark');
  if (existing) return;

  // Invisible watermark in DOM (for forensic analysis)
  const wm = document.createElement('span');
  wm.id = 'civac-watermark';
  wm.setAttribute('aria-hidden', 'true');
  wm.style.cssText = 'position:fixed;opacity:0;pointer-events:none;user-select:none;font-size:0;z-index:-9999';
  wm.textContent = `CIVAC PRO | SoftGan Colombia | Propietario: Johnatan Vallejo Marulanda | © Universal Business Technology ${CIVAC_LICENSE.año} | ID: ${getInstanceFingerprint()}`;
  document.body.appendChild(wm);

  // CSS watermark on print
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      body::before {
        content: "© CIVAC PRO — SoftGan Colombia — Johnatan Vallejo Marulanda — USO INTERNO AUTORIZADO";
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%) rotate(-35deg);
        font-size: 32px; color: rgba(0,0,0,0.08);
        white-space: nowrap; pointer-events: none; z-index: 99999;
        font-family: sans-serif; font-weight: bold;
      }
    }
    .civac-no-select { -webkit-user-select: none; user-select: none; }
  `;
  document.head.appendChild(style);
}

/** Protección contextual en áreas sensibles */
export function applyContextMenuProtection(): void {
  // Allow right-click on general areas, only protect specific elements
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target && typeof target.closest === 'function' && target.closest('[data-protected]')) {
      e.preventDefault();
    }
  });

  // Disable text selection on license elements
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    if (target && typeof target.closest === 'function' && target.closest('[data-protected]')) {
      e.preventDefault();
    }
  });
}

/** Advierte si el dominio no está autorizado */
export function checkDomainAndWarn(): void {
  if (!isDomainAuthorized()) {
    console.warn(
      `%c⚠️ CIVAC PRO — DOMINIO NO AUTORIZADO\n` +
      `%cEste software es propiedad de Universal Business Technology.\n` +
      `Licenciante: SoftGan Colombia\nPropietario: Johnatan Vallejo Marulanda\n` +
      `Uso no autorizado es ilegal. Contacto: soporte@softgan.com.co`,
      'color:#ff4d6d;font-size:16px;font-weight:bold',
      'color:#fbbf24;font-size:12px'
    );
  }
}

/** Inyecta créditos en la consola del navegador */
export function printConsoleBranding(): void {
  console.log(
    `%c🐄 CIVAC PRO v2.1%c\n` +
    `%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Propietario: Johnatan Vallejo Marulanda\n` +
    `Empresa: Universal Business Technology\n` +
    `Licencias: SoftGan Colombia\n` +
    `Marca: CIVAC® — Registro pendiente\n` +
    `© ${CIVAC_LICENSE.año} Todos los derechos reservados\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `ID instancia: ${getInstanceFingerprint()}`,
    'color:#00f5d4;font-size:20px;font-weight:900',
    '',
    'color:#94a3b8;font-size:11px;font-family:monospace'
  );
}

/** Inicializar todos los sistemas de protección */
export function initProtection(): void {
  applyWatermark();
  applyContextMenuProtection();
  checkDomainAndWarn();
  printConsoleBranding();
}
