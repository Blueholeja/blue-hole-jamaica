import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Two color variants of the source art: the black wordmark for light
 * backgrounds (login/signup cards, print page), and a recolored white
 * wordmark for the site's dark green surfaces (navbar, footer, admin
 * sidebar) where the black version would be unreadable.
 */
export default function Logo({ dark = false, height = 36, className }: { dark?: boolean; height?: number; className?: string }) {
  return (
    <Image
      src={dark ? '/images/logo-light.png' : '/images/logo.png'}
      alt="Blue Hole Jamaica"
      width={888}
      height={398}
      priority
      style={{ height, width: 'auto' }}
      className={cn('object-contain', className)}
    />
  )
}
