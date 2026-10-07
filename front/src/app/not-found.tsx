import { BrandButtonLink } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"

export default function NotFound() {
  return (
    <ScreenBody>
      <ScreenTitle>Esta pantalla no está en el flujo</ScreenTitle>
      <p className="text-sm font-light text-body">
        El prototipo del PAS cubre cotizar, cartera, pendientes, siniestros y perfil.
      </p>
      <BrandButtonLink href="/cotizar">Volver a cotizar</BrandButtonLink>
    </ScreenBody>
  )
}
