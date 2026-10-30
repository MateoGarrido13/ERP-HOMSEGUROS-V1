export const quoteWhatsappLabel = "Enviar cotización por WhatsApp"

export function quoteWhatsappMessage(nombre: string) {
  const name = nombre.trim() || "Hola"
  return `${name}, estuve evaluando en las distintas compañías y esta es la mejor alternativa en cuanto a cotización y cobertura`
}
