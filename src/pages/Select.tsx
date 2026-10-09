import { useId, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchVillages, states } from '../data/lgd'
import type { TKey } from '../i18n'
import { useApp } from '../state/AppState'
import type { DemoId } from '../state/store'
import { LangSwitch } from '../ui/Layout'

const STATE_OPTIONS = ['Madhya Pradesh', 'Gujarat', 'Chhattisgarh', 'Jharkhand', 'Odisha', 'Rajasthan', 'Maharashtra', 'Karnataka', 'Other']

export default function Select() {
  const { t, lang, selectVillage, startCustom, loadDemo } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [st, setSt] = useState('')
  const [di, setDi] = useState('')
  const [bl, setBl] = useState('')
  const [gp, setGp] = useState('')
  const [cName, setCName] = useState('')
  const [cDistrict, setCDistrict] = useState('')
  const [cState, setCState] = useState('Madhya Pradesh')
  const ids = { q: useId(), st: useId(), di: useId(), bl: useId(), gp: useId(), cn: useId(), cd: useId(), cs: useId() }

  const hits = useMemo(() => searchVillages(q, 8), [q])
  const state = states.find((s) => s.name === st)
  const district = state?.districts.find((d) => d.name === di)
  const block = district?.blocks.find((b) => b.name === bl)

  const go = (code: string) => {
    if (selectVillage(code)) navigate('/overview')
  }

  const onCustom = (e: FormEvent) => {
    e.preventDefault()
    if (!cName.trim()) return
    startCustom(cName, cDistrict, cState)
    navigate('/carbon')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 min-h-[3.75rem] py-2 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="serif text-xl text-ink" style={{ textDecoration: 'none' }}>
            VASUDHA <span className="figure">CO₂</span>
          </Link>
          <LangSwitch />
        </div>
      </header>
      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl sm:text-4xl mb-3">{t('select.title')}</h1>
        <p className="lede mb-8">{t('select.lede')}</p>

        {/* Search */}
        <section className="mb-10">
          <label htmlFor={ids.q} className="label">
            {t('select.search')}
          </label>
          <input
            id={ids.q}
            type="search"
            className="input"
            placeholder={t('select.searchPh')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            aria-describedby={`${ids.q}-r`}
          />
          <div id={`${ids.q}-r`} aria-live="polite">
            {q.trim().length >= 2 && hits.length === 0 && <p className="hint">{t('select.noResults')}</p>}
            {hits.length > 0 && (
              <ul className="border border-t-0 border-ink-3 bg-card divide-y divide-rule">
                {hits.map((h) => (
                  <li key={h.lgdCode}>
                    <button type="button" className="w-full text-left px-3 py-3 hover:bg-paper flex flex-wrap justify-between gap-2" onClick={() => go(h.lgdCode)}>
                      <span>{lang === 'hi' ? h.labelHi : h.label}</span>
                      <span className="prov prov-assumption" style={{ cursor: 'pointer' }}>
                        {t(h.hasProfile ? 'kind.illustrative' : 'kind.placeholder')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Browse */}
        <section className="sheet mb-10">
          <h2 className="text-xl mb-4">{t('select.browse')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={ids.st} className="label">
                {t('select.state')}
              </label>
              <select id={ids.st} className="select" value={st} onChange={(e) => (setSt(e.target.value), setDi(''), setBl(''), setGp(''))}>
                <option value="">{t('select.choose')}</option>
                {states.map((s) => (
                  <option key={s.name} value={s.name}>
                    {lang === 'hi' ? s.nameHi : s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={ids.di} className="label">
                {t('select.district')}
              </label>
              <select id={ids.di} className="select" value={di} disabled={!state} onChange={(e) => (setDi(e.target.value), setBl(''), setGp(''))}>
                <option value="">{t('select.choose')}</option>
                {state?.districts.map((d) => (
                  <option key={d.name} value={d.name}>
                    {lang === 'hi' ? d.nameHi : d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={ids.bl} className="label">
                {t('select.block')}
              </label>
              <select id={ids.bl} className="select" value={bl} disabled={!district} onChange={(e) => (setBl(e.target.value), setGp(''))}>
                <option value="">{t('select.choose')}</option>
                {district?.blocks.map((b) => (
                  <option key={b.name} value={b.name}>
                    {lang === 'hi' ? b.nameHi : b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={ids.gp} className="label">
                {t('select.gp')}
              </label>
              <select id={ids.gp} className="select" value={gp} disabled={!block} onChange={(e) => setGp(e.target.value)}>
                <option value="">{t('select.choose')}</option>
                {block?.gramPanchayats.map((g) => (
                  <option key={g.lgdCode} value={g.lgdCode}>
                    {(lang === 'hi' ? g.nameHi : g.name) ?? g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="btn mt-5" disabled={!gp} onClick={() => go(gp)}>
            {t('select.analyse')} →
          </button>
          <p className="hint mt-4">{t('select.listNote')}</p>
        </section>

        {/* Not listed */}
        <section className="mb-10">
          <h2 className="text-xl mb-1">{t('select.notListed')}</h2>
          <p className="muted mb-4">{t('select.notListedLede')}</p>
          <form onSubmit={onCustom} className="grid sm:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor={ids.cn} className="label">
                {t('select.name')}
              </label>
              <input id={ids.cn} className="input" value={cName} onChange={(e) => setCName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={ids.cd} className="label">
                {t('select.district')}
              </label>
              <input id={ids.cd} className="input" value={cDistrict} onChange={(e) => setCDistrict(e.target.value)} />
            </div>
            <div>
              <label htmlFor={ids.cs} className="label">
                {t('select.state')}
              </label>
              <select id={ids.cs} className="select" value={cState} onChange={(e) => setCState(e.target.value)}>
                {STATE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <button type="submit" className="btn btn-ghost">
                {t('select.startCustom')} →
              </button>
            </div>
          </form>
        </section>

        {/* Demos */}
        <section className="border-t border-rule pt-8">
          <h2 className="text-xl mb-1">{t('landing.demosTitle')}</h2>
          <p className="muted mb-4">{t('landing.demosNote')}</p>
          <div className="flex flex-wrap gap-3">
            {(['small', 'medium', 'pool'] as DemoId[]).map((d) => (
              <button key={d} type="button" className="btn btn-ghost" onClick={() => navigate(loadDemo(d))}>
                {t(`landing.demo.${d}.title` as TKey)}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
