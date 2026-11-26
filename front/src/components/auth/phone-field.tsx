import { forwardRef, useId } from "react";

import { PREFIJOS_TELEFONICOS, type TelefonoPartes } from "../../lib/auth/validation";
import { cn } from "../../lib/cn";

const controlClass =
  "h-10 rounded-lg border border-field bg-white px-3 text-sm text-title outline-none placeholder:text-placeholder focus:border-focus";

// Bandera a partir del código ISO (indicadores regionales Unicode).
function bandera(iso: string) {
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

interface PhoneFieldProps {
  value: TelefonoPartes;
  onChange: (value: TelefonoPartes) => void;
  error?: string;
}

// Teléfono en tres partes (spec ERP-7, 11/15): prefijo con bandera (+54 por
// defecto), código de área y número. El servidor los concatena como dígitos.
export const PhoneField = forwardRef<HTMLSelectElement, PhoneFieldProps>(function PhoneField(
  { value, onChange, error },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  const invalido = error ? true : undefined;
  const estilo = cn(controlClass, error && "border-danger-strong focus:border-danger-strong");

  return (
    <fieldset className="flex w-full flex-col gap-1.5" aria-describedby={error ? errorId : undefined}>
      <legend className="mb-1.5 text-[13px] font-medium text-slate">Teléfono</legend>
      <div className="flex gap-2">
        <select
          ref={ref}
          name="telefonoPrefijo"
          aria-label="Prefijo internacional"
          aria-invalid={invalido}
          value={value.prefijo}
          onChange={(e) => onChange({ ...value, prefijo: e.target.value })}
          className={cn(estilo, "w-[104px] shrink-0")}
        >
          {PREFIJOS_TELEFONICOS.map((p) => (
            <option key={p.codigo} value={p.codigo}>
              {bandera(p.iso)} +{p.codigo}
            </option>
          ))}
        </select>
        <input
          name="telefonoArea"
          aria-label="Código de área"
          aria-invalid={invalido}
          inputMode="numeric"
          autoComplete="tel-area-code"
          placeholder="11"
          value={value.area}
          onChange={(e) => onChange({ ...value, area: e.target.value })}
          className={cn(estilo, "w-[72px] shrink-0")}
        />
        <input
          name="telefonoNumero"
          aria-label="Número"
          aria-invalid={invalido}
          type="tel"
          inputMode="tel"
          autoComplete="tel-local"
          placeholder="4321-9088"
          value={value.numero}
          onChange={(e) => onChange({ ...value, numero: e.target.value })}
          className={cn(estilo, "min-w-0 flex-1")}
        />
      </div>
      {error ? (
        <span id={errorId} className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </fieldset>
  );
});
