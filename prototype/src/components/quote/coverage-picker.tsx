import Link from "next/link"
import type { ComponentType } from "react"

import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { IconAccidentesPersonales } from "@/icons/accidentes-personales"
import { IconArt } from "@/icons/art"
import { IconAutomotor } from "@/icons/automotor"
import { IconComercio } from "@/icons/comercio"
import { IconHogar } from "@/icons/hogar"
import { IconResponsabilidadCivil } from "@/icons/responsabilidad-civil"
import { IconVida } from "@/icons/vida"
import { cn } from "@/lib/cn"

interface CoveragePickerProps {
  automotorHref: string
  hogarHref: string
  accidentesHref: string
  artHref: string
}

interface CoverageOption {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
}

const upcoming: CoverageOption[] = [
  { id: "rc", label: "Responsabilidad Civil", icon: IconResponsabilidadCivil },
  { id: "vida", label: "Vida", icon: IconVida },
]

const tileClass =
  "flex h-full min-h-[118px] w-full flex-col items-center justify-center gap-2.5 rounded-[20px] border border-line bg-white px-2 py-3.5 text-center"

function CoverageFace({ icon: Icon, label }: CoverageOption) {
  return (
    <>
      <span className="flex size-11 items-center justify-center rounded-full bg-wash text-teal">
        <Icon className="size-6" />
      </span>
      <span className="text-[13px] leading-4 font-medium text-secondary">{label}</span>
    </>
  )
}

const activeTileClass = cn(
  tileClass,
  "transition-colors hover:border-[#605be5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
)

export function CoveragePicker({
  automotorHref,
  hogarHref,
  accidentesHref,
  artHref,
}: CoveragePickerProps) {
  return (
    <ScreenBody>
      <ScreenTitle>Elegí la cobertura</ScreenTitle>
      <ul className="grid grid-cols-2 gap-3">
        <li>
          <Link href={automotorHref} className={activeTileClass}>
            <CoverageFace id="automotor" label="Automotor" icon={IconAutomotor} />
          </Link>
        </li>
        <li>
          <Link href={hogarHref} className={activeTileClass}>
            <CoverageFace id="hogar" label="Hogar" icon={IconHogar} />
          </Link>
        </li>
        <li>
          <Link href={accidentesHref} className={activeTileClass}>
            <CoverageFace
              id="accidentes"
              label="Accidentes Personales"
              icon={IconAccidentesPersonales}
            />
          </Link>
        </li>
        <li>
          <button type="button" className={cn(tileClass, "cursor-default")}>
            <CoverageFace id="comercio" label="Comercio" icon={IconComercio} />
          </button>
        </li>
        <li>
          <Link href={artHref} className={activeTileClass}>
            <CoverageFace id="art" label="ART" icon={IconArt} />
          </Link>
        </li>
        {upcoming.map((option) => (
          <li key={option.id}>
            <button type="button" className={cn(tileClass, "cursor-default")}>
              <CoverageFace {...option} />
            </button>
          </li>
        ))}
      </ul>
    </ScreenBody>
  )
}
