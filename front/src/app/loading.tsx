export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-3 px-5 pt-4" aria-hidden>
      <div className="h-8 w-2/3 animate-pulse rounded bg-line" />
      <div className="h-16 animate-pulse rounded-[6px] bg-line" />
      <div className="h-16 animate-pulse rounded-[6px] bg-line" />
      <div className="h-12 animate-pulse rounded-full bg-line" />
    </div>
  )
}
