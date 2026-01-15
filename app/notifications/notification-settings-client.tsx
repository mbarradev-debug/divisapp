'use client';

import Link from 'next/link';
import { IndicatorValue } from '@/lib/api/mindicador';
import { useFavorites, useNotificationPreferences } from '@/lib/storage';
import { Card, Select } from '@/components/ui';

interface NotificationSettingsClientProps {
  indicators: IndicatorValue[];
}

export function NotificationSettingsClient({ indicators }: NotificationSettingsClientProps) {
  const { favorites } = useFavorites();
  const {
    preferences,
    setEnabled,
    toggleIndicator,
    setTriggerType,
    setThreshold,
    setSensitivity,
    setQuietHours,
    setMaxDaily,
  } = useNotificationPreferences();

  const favoriteIndicators = indicators.filter((ind) => favorites.includes(ind.codigo));
  const hasFavorites = favoriteIndicators.length > 0;
  const selectedCount = preferences.indicators.length;
  const showManyIndicatorsWarning = selectedCount > 5;

  const sensitivityOptions = [
    { value: '0.5', label: '0,5%' },
    { value: '1', label: '1%' },
    { value: '2', label: '2%' },
    { value: '5', label: '5%' },
  ];

  const maxDailyOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '5', label: '5' },
    { value: 'unlimited', label: 'Sin limite' },
  ];

  const thresholdTypeOptions = [
    { value: 'above', label: 'Por encima de' },
    { value: 'below', label: 'Por debajo de' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Global toggle */}
      <Card>
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] text-text">
              Notificaciones
            </p>
            <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
              Recibe alertas sobre cambios en indicadores
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.enabled}
            onClick={() => setEnabled(!preferences.enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset ${
              preferences.enabled ? 'bg-primary' : 'bg-border'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg-subtle shadow-sm ring-0 transition-transform ${
                preferences.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      {preferences.enabled && (
        <>
          {/* Indicator selection */}
          <Card header="Indicadores a seguir">
            <div className="p-4">
              {!hasFavorites ? (
                <div className="py-4 text-center">
                  <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
                    No tienes indicadores favoritos.
                  </p>
                  <p className="mt-1 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-muted">
                    <Link href="/" className="underline hover:text-text">
                      Agrega favoritos
                    </Link>{' '}
                    para poder configurar notificaciones.
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
                    Selecciona los indicadores de tus favoritos que deseas seguir.
                  </p>
                  <div className="flex flex-col gap-2">
                    {favoriteIndicators.map((indicator) => {
                      const isSelected = preferences.indicators.includes(indicator.codigo);
                      return (
                        <label
                          key={indicator.codigo}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-subtle p-3 hover:bg-bg-muted"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleIndicator(indicator.codigo)}
                            className="h-4 w-4 rounded border-border-strong text-primary focus:ring-ring focus:ring-offset-ring-offset"
                          />
                          <span className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-text">
                            {indicator.nombre}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {showManyIndicatorsWarning && (
                    <div className="mt-3 rounded-lg border border-info-border bg-info-bg p-3">
                      <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-info-text">
                        Seleccionaste muchos indicadores. Las notificaciones se agruparan
                        automaticamente.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Trigger type */}
          <Card header="Tipo de alerta">
            <div className="flex flex-col gap-2 p-4">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3 hover:bg-bg-muted">
                <input
                  type="radio"
                  name="triggerType"
                  value="daily"
                  checked={preferences.triggerType === 'daily'}
                  onChange={() => setTriggerType('daily')}
                  className="mt-0.5 h-4 w-4 border-border-strong text-primary focus:ring-ring focus:ring-offset-ring-offset"
                />
                <div>
                  <p className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-text">
                    Cambio diario
                  </p>
                  <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
                    Notificacion cuando el valor cambia respecto al dia anterior.
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3 hover:bg-bg-muted">
                <input
                  type="radio"
                  name="triggerType"
                  value="threshold"
                  checked={preferences.triggerType === 'threshold'}
                  onChange={() => setTriggerType('threshold')}
                  className="mt-0.5 h-4 w-4 border-border-strong text-primary focus:ring-ring focus:ring-offset-ring-offset"
                />
                <div>
                  <p className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-text">
                    Umbral de precio
                  </p>
                  <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
                    Notificacion cuando el valor cruza un limite definido.
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3 hover:bg-bg-muted">
                <input
                  type="radio"
                  name="triggerType"
                  value="significant"
                  checked={preferences.triggerType === 'significant'}
                  onChange={() => setTriggerType('significant')}
                  className="mt-0.5 h-4 w-4 border-border-strong text-primary focus:ring-ring focus:ring-offset-ring-offset"
                />
                <div>
                  <p className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-text">
                    Variacion significativa
                  </p>
                  <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
                    Notificacion cuando el cambio supera un porcentaje definido.
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* Threshold configuration - only show when threshold type selected and indicators selected */}
          {preferences.triggerType === 'threshold' && preferences.indicators.length > 0 && (
            <Card header="Configurar umbrales">
              <div className="flex flex-col gap-4 p-4">
                {preferences.indicators.map((codigo) => {
                  const indicator = indicators.find((ind) => ind.codigo === codigo);
                  if (!indicator) return null;
                  const threshold = preferences.thresholds[codigo];
                  return (
                    <div
                      key={codigo}
                      className="rounded-lg border border-border-subtle p-3"
                    >
                      <p className="mb-2 text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
                        {indicator.nombre}
                      </p>
                      <div className="flex gap-2">
                        <select
                          value={threshold?.type || 'above'}
                          onChange={(e) => {
                            const newType = e.target.value as 'above' | 'below';
                            setThreshold(codigo, {
                              type: newType,
                              value: threshold?.value || 0,
                            });
                          }}
                          className="h-10 rounded-lg border border-border-strong bg-bg-subtle px-2 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        >
                          {thresholdTypeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={threshold?.value || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              setThreshold(codigo, {
                                type: threshold?.type || 'above',
                                value,
                              });
                            }
                          }}
                          placeholder="Valor"
                          className="h-10 w-full rounded-lg border border-border-strong bg-bg-subtle px-3 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text placeholder:text-text-placeholder focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Sensitivity - only show when significant variation type selected */}
          {preferences.triggerType === 'significant' && (
            <Card header="Sensibilidad">
              <div className="p-4">
                <p className="mb-3 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
                  Porcentaje minimo de cambio para recibir una notificacion.
                </p>
                <Select
                  id="sensitivity"
                  label="Porcentaje de variacion"
                  options={sensitivityOptions}
                  value={String(preferences.sensitivity)}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value) as 0.5 | 1 | 2 | 5)}
                />
              </div>
            </Card>
          )}

          {/* Quiet hours */}
          <Card header="Horario silencioso">
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-text">
                    Activar horario silencioso
                  </p>
                  <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
                    No recibir notificaciones en cierto horario.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.quietHours.enabled}
                  onClick={() =>
                    setQuietHours({
                      ...preferences.quietHours,
                      enabled: !preferences.quietHours.enabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset ${
                    preferences.quietHours.enabled ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg-subtle shadow-sm ring-0 transition-transform ${
                      preferences.quietHours.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {preferences.quietHours.enabled && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label
                      htmlFor="quiet-start"
                      className="mb-1.5 block text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text"
                    >
                      Desde
                    </label>
                    <input
                      id="quiet-start"
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) =>
                        setQuietHours({
                          ...preferences.quietHours,
                          start: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-lg border border-border-strong bg-bg-subtle px-3 text-[length:var(--text-body)] leading-[var(--leading-body)] text-text focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="quiet-end"
                      className="mb-1.5 block text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text"
                    >
                      Hasta
                    </label>
                    <input
                      id="quiet-end"
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) =>
                        setQuietHours({
                          ...preferences.quietHours,
                          end: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-lg border border-border-strong bg-bg-subtle px-3 text-[length:var(--text-body)] leading-[var(--leading-body)] text-text focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Max daily notifications */}
          <Card header="Limite diario">
            <div className="p-4">
              <p className="mb-3 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
                Maximo de notificaciones por dia.
              </p>
              <Select
                id="maxDaily"
                label="Notificaciones maximas"
                options={maxDailyOptions}
                value={preferences.maxDaily === null ? 'unlimited' : String(preferences.maxDaily)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'unlimited') {
                    setMaxDaily(null);
                  } else {
                    setMaxDaily(parseInt(value) as 1 | 2 | 3 | 5);
                  }
                }}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
