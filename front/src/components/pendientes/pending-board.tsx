"use client"

import { useState } from "react"

import { useSignedName } from "@/components/auth/signed-identity"
import { ShareNotice } from "@/components/collections/share-notice"
import {
  ConfirmCard,
  DetailField,
} from "@/components/pendientes/confirm-card"
import { BrandButton } from "@/components/ui/brand-button"
import { ChoiceField } from "@/components/ui/choice-field"
import { StatusPill } from "@/components/ui/status-pill"
import { SurfaceCard } from "@/components/ui/surface-card"
import { TextArea } from "@/components/ui/text-field"
import { formatShortDate } from "@/lib/format"
import { personalizeName } from "@/lib/mock-pas"
import {
  noticeCardTone,
  noticeLabel,
  noticeWhatsappMessage,
  pendingWhatsappLabel,
  waitingLabel,
  type PendingNotice,
} from "@/lib/pendientes"

type QuoteNext = "alta" | "lead"

interface PendingBoardProps {
  notices: PendingNotice[]
  openId: string | null
  onToggle: (id: string) => void
  onResolve: (notice: PendingNotice, quote?: { next: QuoteNext; comment: string }) => void
  onWhatsapp: (notice: PendingNotice) => void
}

export function PendingBoard({
  notices,
  openId,
  onToggle,
  onResolve,
  onWhatsapp,
}: PendingBoardProps) {
  const name = useSignedName()

  if (notices.length === 0) return null

  return (
    <>
      {notices.map((notice) => {
        const isOpen = openId === notice.id
        const message = personalizeName(noticeWhatsappMessage(notice, name), name)
        const pill = notice.status === "esperando-respuesta" ? "gestion" : notice.pill

        return (
          <div key={notice.id} className="flex flex-col gap-2.5">
            <SurfaceCard
              tone={noticeCardTone(notice)}
              onClick={() => onToggle(notice.id)}
              expanded={isOpen}
            >
              <StatusPill tone={pill}>{noticeLabel(notice)}</StatusPill>
              <p className="mt-2 text-base font-medium text-ink">{notice.holder}</p>
              <p className="mt-1 text-[13px] font-light text-body">{notice.coverage}</p>
              <p className="mt-3 text-[11px] font-medium tracking-wide text-muted">
                FECHA DE IMPORTANCIA
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {formatShortDate(notice.dueOn)}
              </p>
              {notice.status === "esperando-respuesta" ? (
                <p className="mt-2 text-[13px] font-medium text-teal-deep">{waitingLabel}</p>
              ) : null}
              {notice.status === "cobro-pendiente" ? (
                <p className="mt-2 text-[13px] font-light text-body">{message}</p>
              ) : null}
            </SurfaceCard>
            {isOpen ? (
              <NoticeDetail
                key={notice.id}
                notice={notice}
                message={message}
                onResolve={onResolve}
                onWhatsapp={() => onWhatsapp(notice)}
              />
            ) : null}
          </div>
        )
      })}
    </>
  )
}

interface NoticeDetailProps {
  notice: PendingNotice
  message: string
  onResolve: (notice: PendingNotice, quote?: { next: QuoteNext; comment: string }) => void
  onWhatsapp: () => void
}

function NoticeDetail({ notice, message, onResolve, onWhatsapp }: NoticeDetailProps) {
  const [resolving, setResolving] = useState(false)
  const [quoteNext, setQuoteNext] = useState<QuoteNext | null>(null)
  const [rejectComment, setRejectComment] = useState("")
  const [choiceError, setChoiceError] = useState<string>()
  const confirmTitle = resolveTitle(notice)

  function confirm() {
    if (notice.type === "cotizacion-enviada") {
      if (!quoteNext) {
        setChoiceError("Elegí Dar de alta o Lead.")
        return
      }
      onResolve(notice, { next: quoteNext, comment: rejectComment })
      return
    }
    onResolve(notice)
    setResolving(false)
    setQuoteNext(null)
    setRejectComment("")
  }

  return (
    <>
      <SurfaceCard>
        <div className="flex flex-col gap-3">
          {notice.coverages.length > 1 ? (
            <DetailField label="COBERTURAS">
              {notice.coverages.map((item) => (
                <p key={`${item.ramo}-${item.company}`}>
                  {item.ramo} · {item.company}
                </p>
              ))}
            </DetailField>
          ) : !notice.quote && notice.coverages[0] ? (
            <DetailField label="COMPAÑÍA">{notice.coverages[0].company}</DetailField>
          ) : null}
          {notice.payment ? (
            <>
              <DetailField label="MEDIO DE PAGO">{notice.payment.method}</DetailField>
              <DetailField label="CUOTA">{notice.payment.installment}</DetailField>
              <DetailField label="MOTIVO">{notice.payment.reason}</DetailField>
            </>
          ) : null}
          {notice.quote ? (
            <>
              <DetailField label="BIEN">{notice.quote.good}</DetailField>
              <DetailField label="COBERTURA OFRECIDA">
                {notice.quote.coverage} · {notice.quote.company}
              </DetailField>
              <DetailField label="PREMIO">{notice.quote.premium} por mes</DetailField>
            </>
          ) : null}
          {notice.type === "enviar-cupon" && notice.policy ? (
            <>
              <DetailField label="EDIFICIO">{notice.policy.building}</DetailField>
              <DetailField label="PÓLIZA">
                {notice.policy.number} · {notice.policy.company}
              </DetailField>
              <DetailField label="VIGENCIA ANUAL">
                {formatShortDate(notice.policy.vigenciaFrom ?? "")} –{" "}
                {formatShortDate(notice.policy.vigenciaTo ?? "")}
              </DetailField>
              <DetailField label="ADMINISTRADOR">{notice.policy.administrator}</DetailField>
            </>
          ) : null}
        </div>
      </SurfaceCard>
      {resolving ? (
        <ConfirmCard
          title={confirmTitle}
          confirmLabel="Confirmar"
          onConfirm={confirm}
          onCancel={() => {
            setResolving(false)
            setQuoteNext(null)
            setRejectComment("")
            setChoiceError(undefined)
          }}
        >
          {notice.type === "cotizacion-enviada" ? (
            <>
              <ChoiceField
                label="Estado siguiente"
                name={`siguiente-${notice.id}`}
                value={quoteNext}
                onChange={(value) => {
                  setQuoteNext(value as QuoteNext)
                  setChoiceError(undefined)
                }}
                options={[
                  { id: "alta", label: "Dar de alta" },
                  { id: "lead", label: "Lead" },
                ]}
                error={choiceError}
              />
              {quoteNext === "lead" ? (
                <TextArea
                  label="Comentario (opcional)"
                  name={`rechazo-${notice.id}`}
                  value={rejectComment}
                  onChange={(event) => setRejectComment(event.target.value)}
                />
              ) : null}
            </>
          ) : null}
        </ConfirmCard>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notice.type === "enviar-cupon" ? null : (
            <BrandButton
              type="button"
              onClick={() => {
                setChoiceError(undefined)
                setResolving(true)
              }}
            >
              Resolver
            </BrandButton>
          )}
          {notice.status === "cobro-pendiente" ? (
            <p className="text-[13px] font-light text-body">
              El cupón ya se envió al administrador. El aviso sigue en Pendientes, en Cobro
              pendiente.
            </p>
          ) : null}
          {notice.phone ? (
            <ShareNotice
              actionLabel={
                notice.type === "enviar-cupon" && notice.status === "pendiente"
                  ? "Enviar cupón al administrador"
                  : pendingWhatsappLabel
              }
              message={message}
              onShared={onWhatsapp}
            />
          ) : (
            <>
              <BrandButton type="button" variant="whatsapp" disabled>
                {pendingWhatsappLabel}
              </BrandButton>
              <p className="text-xs text-danger">Este cliente no tiene teléfono.</p>
            </>
          )}
        </div>
      )}
    </>
  )
}

function resolveTitle(notice: PendingNotice) {
  if (notice.type === "pago-rechazado" && notice.status === "pendiente") {
    return "Esto deja el aviso en espera de la respuesta del cliente."
  }
  if (notice.type === "pago-rechazado") {
    return "Confirmá solo si el cliente ya pagó y respondió."
  }
  if (notice.type === "cotizacion-enviada") {
    return "¿Cómo sigue esta cotización?"
  }
  if (notice.type === "enviar-poliza") {
    return "¿Resolvés el aviso de enviar póliza?"
  }
  if (notice.type === "enviar-cupon") {
    return "El cupón queda en Cobro pendiente."
  }
  return "¿Resolvés el aviso de cumpleaños?"
}
