import { Avatar } from '@/components/Avatar'
import { Container } from '@/components/Container'
import { HyperspaceBackground } from '@/components/HyperspaceBackground'
import { TerminalIntro } from '@/components/TerminalIntro'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/content/site'
import { Linkedin, Mail } from 'lucide-react'

const ctaButtonClass = 'cta-hyperspace w-full justify-center rounded-md text-base'
const externalLinkProps = {
  target: '_blank',
  rel: 'noreferrer noopener',
} as const

function App() {
  const emailHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent(siteConfig.emailSubject)}`

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-foreground">
      <HyperspaceBackground />
      <Container className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 py-16 text-center">
        <Avatar src="/avatar.jpg" alt={`${siteConfig.name} avatar`} />
        <TerminalIntro text={siteConfig.introText} />
        <p className="max-w-2xl text-balance text-base leading-relaxed text-zinc-300 sm:text-lg">
          {siteConfig.bio.rolePrefix}{' '}
          <a
            href={siteConfig.bio.companyUrl}
            {...externalLinkProps}
            className="rounded-sm font-medium text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
          >
            {siteConfig.bio.companyName}
          </a>
          . {siteConfig.bio.previous} {siteConfig.bio.personal}
        </p>
        <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild size="lg" className={`${ctaButtonClass} cta-hyperspace--light`}>
            <a href={emailHref}>
              <Mail className="h-5 w-5" aria-hidden="true" />
              Email
            </a>
          </Button>
          <Button asChild variant="secondary" size="lg" className={ctaButtonClass}>
            <a href={siteConfig.linkedinUrl} {...externalLinkProps}>
              <Linkedin className="h-5 w-5" aria-hidden="true" />
              LinkedIn
            </a>
          </Button>
        </div>
      </Container>
    </main>
  )
}

export default App
