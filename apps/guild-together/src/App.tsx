import { useEffect, useState } from 'react'
import { DEFAULT_PROFILE, type Profile } from './data'
import { AboutYou } from './components/AboutYou'
import { Buddies } from './components/Buddies'
import { Circle } from './components/Circle'
import { CoworkerStep, DEFAULT_COWORKER, type Coworker } from './components/Coworker'
import { Welcome } from './components/Welcome'

const STEPS = ['Welcome', 'About you', 'Study buddies', 'Bring a coworker', 'Your circle']

// `?embed` hides the site chrome so the prototype sits cleanly inside an iframe.
const embed = new URLSearchParams(window.location.search).has('embed')

export default function App() {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [circle, setCircle] = useState<string[]>([])
  const [coworker, setCoworker] = useState<Coworker>(DEFAULT_COWORKER)
  // window.scrollTo stays inside an iframe; scrollIntoView would also scroll the host page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const restart = () => {
    setProfile(DEFAULT_PROFILE)
    setCircle([])
    setCoworker(DEFAULT_COWORKER)
    setStep(0)
  }

  return (
    <div className={`app ${embed ? 'embed' : ''}`}>
      <header className="nav">
        <div className="logo">Guild</div>
        <nav className="steps" aria-label="Prototype steps">
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`step ${i === step ? 'current' : ''} ${i < step ? 'done' : ''}`}
              aria-current={i === step ? 'step' : undefined}
              onClick={() => setStep(i)}
            >
              <span className="step-dot">{i < step ? '✓' : i + 1}</span>
              <span className="step-label">{s}</span>
            </button>
          ))}
        </nav>
      </header>

      <main key={step} className="stage">
        {step === 0 && <Welcome onNext={() => setStep(1)} />}
        {step === 1 && <AboutYou profile={profile} setProfile={setProfile} onNext={() => setStep(2)} />}
        {step === 2 && (
          <Buddies
            profile={profile}
            circle={circle}
            onConnect={(id) => setCircle((c) => (c.includes(id) ? c : [...c, id]))}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <CoworkerStep profile={profile} coworker={coworker} setCoworker={setCoworker} onNext={() => setStep(4)} onBack={() => setStep(2)} />
        )}
        {step === 4 && <Circle profile={profile} circle={circle} coworker={coworker} onRestart={restart} goTo={setStep} />}
      </main>

      {!embed && (
        <footer className="credits">
          Concept prototype from a needfinding study of retail workers, by Abigail DeLory, Andrew Huang & Hazel Jones. Not
          affiliated with Guild. People shown are composites from our interviews.
        </footer>
      )}
    </div>
  )
}
