"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";

import { cerrarSesion } from "../../app/(app)/perfil/logout-action";
import { BrandButton } from "../ui/brand-button";

export function LogoutButton() {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const tituloId = useId();

  useEffect(() => {
    if (!abierto) return;
    const dialogo = dialogRef.current;
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const botones = () =>
      [...(dialogo?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];

    botones()[0]?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pendiente) {
        event.preventDefault();
        setAbierto(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = botones();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      antes?.focus();
    };
  }, [abierto, pendiente]);

  function confirmar() {
    startTransition(() => {
      void cerrarSesion();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-sm font-medium text-danger"
      >
        Cerrar sesión
      </button>
      {abierto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            className="w-full max-w-[390px] rounded-xl border border-danger-border bg-danger-bg p-4"
          >
            <p id={tituloId} className="text-sm font-medium text-title">
              ¿Querés cerrar la sesión?
            </p>
            <BrandButton
              variant="outline"
              className="mt-3"
              disabled={pendiente}
              onClick={() => setAbierto(false)}
            >
              Cancelar
            </BrandButton>
            <BrandButton
              variant="danger"
              className="mt-3"
              disabled={pendiente}
              onClick={confirmar}
            >
              Cerrar sesión
            </BrandButton>
          </div>
        </div>
      ) : null}
    </>
  );
}
