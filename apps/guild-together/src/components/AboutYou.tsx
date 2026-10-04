import { COURSES, INTERESTS, ROLES, STORES, type Profile, type Slot } from '../data'
import { Chip, WeekGrid } from './ui'

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

export function AboutYou({
  profile,
  setProfile,
  onNext,
}: {
  profile: Profile
  setProfile: (p: Profile) => void
  onNext: () => void
}) {
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile({ ...profile, [key]: value })
  const ready = profile.courses.length > 0 && profile.availability.length > 0

  return (
    <section className="panel">
      <div className="panel-body narrow">
        <p className="eyebrow">Step 1 · About you</p>
        <h2 className="title">Tell us a little about yourself.</h2>
        <p className="lede">We'll use this to find people learning what you're learning, on a schedule that works for you both.</p>

        <div className="form-grid">
          <label>
            <span>First name</span>
            <input value={profile.name} placeholder="You" onChange={(e) => set('name', e.target.value)} />
          </label>
          <label>
            <span>Where you work</span>
            <select value={profile.store} onChange={(e) => set('store', e.target.value)}>
              {STORES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Your role</span>
            <select value={profile.role} onChange={(e) => set('role', e.target.value)}>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend>Courses you're taking or curious about</legend>
          <div className="chips">
            {COURSES.map((c) => (
              <Chip key={c} selected={profile.courses.includes(c)} onClick={() => set('courses', toggle(profile.courses, c))}>
                {c}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Outside of work, you're into…</legend>
          <div className="chips">
            {INTERESTS.map((i) => (
              <Chip key={i} selected={profile.interests.includes(i)} onClick={() => set('interests', toggle(profile.interests, i))}>
                {i}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>When could you study? Tap to toggle.</legend>
          <WeekGrid mine={profile.availability} onToggle={(s: Slot) => set('availability', toggle(profile.availability, s))} />
        </fieldset>

        <button className="btn primary" disabled={!ready} onClick={onNext}>
          Find my study buddies →
        </button>
        {!ready && <p className="hint">Pick at least one course and one time slot.</p>}
      </div>
    </section>
  )
}
