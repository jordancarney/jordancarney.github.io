import { cn } from '@/lib/utils'

interface AvatarProps {
  src: string
  alt: string
  className?: string
}

export function Avatar({ src, alt, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative h-36 w-36 overflow-hidden rounded-full border border-zinc-700/80 bg-zinc-900 shadow-xl shadow-black/30 sm:h-40 sm:w-40',
        className
      )}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  )
}
