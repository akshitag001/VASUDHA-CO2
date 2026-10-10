import { useId, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchVillages, states } from '../data/lgd'
import type { TKey } from '../i18n'
import { useApp } from '../state/AppState'
import type { DemoId } from '../state/store'
import { LangSwitch } from '../ui/Layout'
<<<<<<< HEAD
import { Art, Logo, Parallax, Sketch } from '../ui/motion'
=======
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97

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
<<<<<<< HEAD
    if (selectVillage(code)) navigate('/overview', { viewTransition: true })
=======
    if (selectVillage(code)) navigate('/overview')
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
  }

  const onCustom = (e: FormEvent) => {
    e.preventDefault()
    if (!cName.trim()) return
    startCustom(cName, cDistrict, cState)
<<<<<<< HEAD
    navigate('/carbon', { viewTransition: true })
=======
    navigate('/carbon')
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
  }

  return (
    <div className="min-h-screen">
<<<<<<< HEAD
      <header className="no-print sticky top-0 z-40 px-3 pt-3">
        <div className="nav-pill glass max-w-4xl mx-auto rounded-[16px] px-3 py-2 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="VASUDHA CO2 home">
            <Logo />
=======
      <header className="border-b border-ink">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 min-h-[3.75rem] py-2 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="serif text-xl text-ink" style={{ textDecoration: 'none' }}>
            VASUDHA <span className="figure">CO₂</span>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
          </Link>
          <LangSwitch />
        </div>
      </header>
<<<<<<< HEAD
      <div className="relative overflow-hidden">
        <Parallax speed={-0.2} className="absolute inset-0 pointer-events-none">
          <div className="blob" style={{ width: 360, height: 360, left: '-6%', top: '-4%', background: '#ffe95c', opacity: 0.6 }} />
          <div className="blob" style={{ width: 320, height: 320, right: '-4%', top: '10%', background: '#a8e5e5', opacity: 0.5 }} />
        </Parallax>
        <Parallax speed={-0.12} className="absolute right-[2%] top-4 w-[15rem] xl:w-[19rem] hidden lg:block pointer-events-none">
          <Art name="select-corner" eager className="w-full art-pop" />
        </Parallax>
        <Sketch kind="stars" className="absolute left-[3%] top-24 w-16 float hidden sm:block" style={{ opacity: 0.25 }} />
      <main id="main" className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <span className="badge mb-6" data-reveal>
          <span aria-hidden="true">✦</span> {t('app.chooseVillage')}
        </span>
        <h1 className="display display-lg mb-5" data-reveal>
          {t('select.title')}
        </h1>
        <p className="lede mb-10" data-reveal>
          {t('select.lede')}
        </p>

        {/* Search */}
        <section className="mb-12 sheet" data-reveal style={{ borderColor: '#1a3300', boxShadow: '6px 6px 0 #1a3300' }}>
          <label htmlFor={ids.q} className="label text-lg">
=======
      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl sm:text-4xl mb-3">{t('select.title')}</h1>
        <p className="lede mb-8">{t('select.lede')}</p>

        {/* Search */}
        <section className="mb-10">
          <label htmlFor={ids.q} className="label">
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
            {t('select.search')}
          </label>
          <input
            id={ids.q}
            type="search"
            className="input"
<<<<<<< HEAD
            style={{ minHeight: '3.4rem', fontSize: '1.1rem' }}
=======
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
            placeholder={t('select.searchPh')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            aria-describedby={`${ids.q}-r`}
          />
          <div id={`${ids.q}-r`} aria-live="polite">
<<<<<<< HEAD
            {q.trim().length >= 2 && hits.length === 0 && (
              <div className="flex items-center gap-4 mt-3">
                <Art name="empty-state" className="w-28 shrink-0 art-pop" />
                <p className="hint" style={{ marginTop: 0 }}>
                  {t('select.noResults')}
                </p>
              </div>
            )}
            {hits.length > 0 && (
              <ul className="mt-2 border border-ink rounded-[12px] overflow-hidden bg-card divide-y divide-rule">
                {hits.map((h) => (
                  <li key={h.lgdCode}>
                    <button type="button" className="w-full text-left px-3 py-3 hover:bg-yellow transition-colors flex flex-wrap justify-between gap-2" onClick={() => go(h.lgdCode)}>
=======
            {q.trim().length >= 2 && hits.length === 0 && <p className="hint">{t('select.noResults')}</p>}
            {hits.length > 0 && (
              <ul className="border border-t-0 border-ink-3 bg-card divide-y divide-rule">
                {hits.map((h) => (
                  <li key={h.lgdCode}>
                    <button type="button" className="w-full text-left px-3 py-3 hover:bg-paper flex flex-wrap justify-between gap-2" onClick={() => go(h.lgdCode)}>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
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
<<<<<<< HEAD
        <section className="sheet mb-12" data-reveal>
          <h2 className="text-2xl mb-5">{t('select.browse')}</h2>
=======
        <section className="sheet mb-10">
          <h2 className="text-xl mb-4">{t('select.browse')}</h2>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
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
<<<<<<< HEAD
        <section className="mb-12 note-card bg-mint" data-reveal style={{ transform: 'none' }}>
          <h2 className="text-2xl mb-1">{t('select.notListed')}</h2>
=======
        <section className="mb-10">
          <h2 className="text-xl mb-1">{t('select.notListed')}</h2>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
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
<<<<<<< HEAD
        <section className="border-t border-dashed border-rule pt-10" data-reveal>
          <h2 className="text-2xl mb-1">{t('landing.demosTitle')}</h2>
          <p className="muted mb-4">{t('landing.demosNote')}</p>
          <div className="flex flex-wrap gap-3">
            {(['small', 'medium', 'pool'] as DemoId[]).map((d) => (
              <button key={d} type="button" className="btn btn-pastel" onClick={() => navigate(loadDemo(d), { viewTransition: true })}>
=======
        <section className="border-t border-rule pt-8">
          <h2 className="text-xl mb-1">{t('landing.demosTitle')}</h2>
          <p className="muted mb-4">{t('landing.demosNote')}</p>
          <div className="flex flex-wrap gap-3">
            {(['small', 'medium', 'pool'] as DemoId[]).map((d) => (
              <button key={d} type="button" className="btn btn-ghost" onClick={() => navigate(loadDemo(d))}>
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
                {t(`landing.demo.${d}.title` as TKey)}
              </button>
            ))}
          </div>
        </section>
      </main>
<<<<<<< HEAD
      </div>
=======
>>>>>>> 0e2db22eb360a92caa6b2424fc0a80f3d6b2bc97
    </div>
  )
}
