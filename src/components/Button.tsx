import type { ButtonHTMLAttributes, Ref } from 'react'

type Variant = 'primary' | 'action' | 'ghost'

const variantClass: Record<Variant, string> = {
  primary: 'bg-lavender text-white',
  action: 'bg-coral text-ink',
  ghost: 'bg-surface text-ink',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  fullWidth?: boolean
  ref?: Ref<HTMLButtonElement>
}

// DESIGN.md §5: primary = lavender, action = coral, ghost = surface, disabled = locked bez cienia.
export function Button({ variant = 'primary', fullWidth = true, className = '', disabled, ...rest }: Props) {
  const look = disabled ? 'bg-locked text-ink-muted shadow-none cursor-not-allowed' : `${variantClass[variant]} press-lg`
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`sticker rounded-md min-h-[52px] px-5 font-body text-body font-bold uppercase tracking-wide
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender
        ${fullWidth ? 'w-full' : ''} ${look} ${className}`}
    />
  )
}
