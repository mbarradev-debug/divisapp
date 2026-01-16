'use client';

import { useState } from 'react';
import { useUserSettings, useAuthState } from '@/lib/storage';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { ThemePreference, HomeOrderingMode, IndicatorCode } from '@/lib/domain/user-settings';

const APP_VERSION = '0.1.0';

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

const INDICATOR_OPTIONS: { value: IndicatorCode; label: string }[] = [
  { value: 'uf', label: 'UF' },
  { value: 'dolar', label: 'Dólar' },
  { value: 'euro', label: 'Euro' },
  { value: 'utm', label: 'UTM' },
  { value: 'ipc', label: 'IPC' },
  { value: 'ivp', label: 'IVP' },
  { value: 'dolar_intercambio', label: 'Dólar Intercambio' },
  { value: 'imacec', label: 'IMACEC' },
  { value: 'tpm', label: 'TPM' },
  { value: 'libra_cobre', label: 'Libra de Cobre' },
  { value: 'tasa_desempleo', label: 'Tasa de Desempleo' },
  { value: 'bitcoin', label: 'Bitcoin' },
];

const ORDERING_OPTIONS = [
  { value: 'default', label: 'Por defecto' },
  { value: 'favorites-first', label: 'Favoritos primero' },
  { value: 'custom', label: 'Personalizado' },
];

// Storage keys for reset functionality
const LOCAL_STORAGE_KEYS = [
  'divisapp_favorites',
  'divisapp_last_conversion',
  'divisapp_recents',
  'divisapp_user_settings',
  'divisapp_notification_preferences',
  'divisapp_auth_preview',
];

export function SettingsClient() {
  const { settings, updateSettings, resetSettings } = useUserSettings();
  const { isAuthenticated, toggleAuthPreview } = useAuthState();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ theme: e.target.value as ThemePreference });
  };

  const handleIndicatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ defaultIndicator: e.target.value as IndicatorCode });
  };

  const handleOrderingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ homeOrderingMode: e.target.value as HomeOrderingMode });
  };

  const handleAlertsToggle = () => {
    updateSettings({ alertsEnabled: !settings.alertsEnabled });
  };

  const handleResetData = () => {
    // Clear all local storage keys used by the app
    LOCAL_STORAGE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently fail if localStorage is unavailable
      }
    });
    // Reset settings to defaults
    resetSettings();
    setShowResetConfirm(false);
    // Reload to ensure clean state
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Account Section */}
      <section>
        <h2 className="mb-4 text-[length:var(--text-section)] font-medium leading-[var(--leading-section)] text-text">
          Cuenta
        </h2>
        <div className="rounded-lg border border-border-subtle bg-bg-subtle p-4">
          <div className="flex items-start gap-3">
            {/* User icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-muted">
              <svg
                className="h-5 w-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] text-text">
                  {isAuthenticated ? 'Modo vista previa' : 'Usuario anónimo'}
                </span>
                {isAuthenticated && (
                  <span className="rounded bg-info-bg px-1.5 py-0.5 text-[length:var(--text-small)] leading-[var(--leading-small)] text-info-text">
                    Preview
                  </span>
                )}
              </div>
              <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
                {isAuthenticated
                  ? 'Estás viendo una vista previa del modo autenticado. Esta es una simulación.'
                  : 'La app funciona completamente sin cuenta. Tus datos se guardan localmente en este dispositivo.'}
              </p>
            </div>
          </div>

          {/* Future benefits callout */}
          <div className="mt-4 rounded-md border border-info-border bg-info-bg p-3">
            <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-info-text">
              <strong>Próximamente:</strong> Con una cuenta podrás sincronizar
              tus favoritos y preferencias entre dispositivos.
            </p>
          </div>

          {/* Preview toggle for development */}
          <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
            <div>
              <span className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
                Vista previa de cuenta
              </span>
              <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-muted">
                Simula el estado autenticado (solo para desarrollo)
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAuthenticated}
              onClick={toggleAuthPreview}
              className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset ${
                isAuthenticated ? 'bg-primary' : 'bg-border-strong'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-bg-subtle transition-transform ${
                  isAuthenticated ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section>
        <h2 className="mb-4 text-[length:var(--text-section)] font-medium leading-[var(--leading-section)] text-text">
          Preferencias
        </h2>
        <div className="flex flex-col gap-5">
          <Select
            id="theme"
            label="Tema"
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={handleThemeChange}
          />

          <Select
            id="defaultIndicator"
            label="Indicador por defecto"
            options={INDICATOR_OPTIONS}
            value={settings.defaultIndicator}
            onChange={handleIndicatorChange}
          />

          <Select
            id="homeOrdering"
            label="Orden en inicio"
            options={ORDERING_OPTIONS}
            value={settings.homeOrderingMode}
            onChange={handleOrderingChange}
          />

          {/* Alerts Toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
              Alertas
            </span>
            <label className="flex cursor-pointer items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={settings.alertsEnabled}
                onClick={handleAlertsToggle}
                className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset ${
                  settings.alertsEnabled ? 'bg-primary' : 'bg-border-strong'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-bg-subtle transition-transform ${
                    settings.alertsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-text-secondary">
                {settings.alertsEnabled ? 'Activadas' : 'Desactivadas'}
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section>
        <h2 className="mb-4 text-[length:var(--text-section)] font-medium leading-[var(--leading-section)] text-text">
          Información
        </h2>
        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-subtle px-4 py-3">
          <span className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
            Versión de la aplicación
          </span>
          <span className="font-mono text-[length:var(--text-label)] leading-[var(--leading-label)] text-text">
            {APP_VERSION}
          </span>
        </div>
      </section>

      {/* Danger Zone Section */}
      <section>
        <h2 className="mb-4 text-[length:var(--text-section)] font-medium leading-[var(--leading-section)] text-text">
          Datos locales
        </h2>
        {!showResetConfirm ? (
          <Button
            variant="secondary"
            onClick={() => setShowResetConfirm(true)}
            className="border-error text-error hover:bg-error-bg"
          >
            Restablecer datos locales
          </Button>
        ) : (
          <div className="rounded-lg border border-error-border bg-error-bg p-4">
            <p className="mb-4 text-[length:var(--text-body)] leading-[var(--leading-body)] text-error-text">
              Esta acción eliminará todos tus favoritos, conversiones recientes y
              preferencias. ¿Deseas continuar?
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleResetData}
                className="bg-error hover:bg-error/90"
              >
                Sí, restablecer
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
