import { useMemo, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import { pick, type ActivityKey } from '../engine'
import { bearerFraction, annualCosts } from '../engine'
import { LANGS, makeT, useDict, type TKey } from '../i18n'
import { inr, inrRange, type Lang } from '../lib/format'
import { offerResult } from '../model/analysis'
import { useApp } from '../state/AppState'
import { PageHeader, Seg } from '../ui/bits'

function Qr({ text, label }: { text: string; label: string }) {
  const src = useMemo(() => {
    try {
      const qr = qrcode(0, 'L')
      qr.addData(text)
      qr.make()
      return qr.createDataURL(3, 2)
    } catch {
      return null // too long to encode; the printed link still works
    }
  }, [text])
  if (!src) return null
  return <img src={src} alt={label} width={132} height={132} style={{ imageRendering: 'pixelated', width: '34mm', height: '34mm' }} />
}

export default function Brief() {
  const { t: tApp, lang: appLang, village, analysis, state, shareUrl } = useApp()
  const [lang, setLang] = useState<Lang>(appLang)
  const [pdf, setPdf] = useState<'idle' | 'busy' | 'fail'>('idle')
  const ref = useRef<HTMLDivElement>(null)
  const dict = useDict(lang)
  const t = useMemo(() => makeT(dict), [dict])
  const url = useMemo(() => shareUrl(), [shareUrl])

  if (!village || !analysis) return null
  const a = analysis
  const usingOffer = state.offerCheckedAt != null
  const offer = state.offer
  const scen = usingOffer ? offerResult(a, offer).scenarios : a.scenarios
  const years = usingOffer ? offer.contractYears : state.settings.durationYears
  const bearer = usingOffer ? offer.mrvPaidBy : state.settings.costBearer
  const net = pick(scen, (r) => r.net)
  const perHH = pick(scen, (r) => r.netPerHousehold)
  const total = pick(scen, (r) => r.netOverContract)
  const villageCost = annualCosts(a.finance.costs, 'mid', years).total * bearerFraction(bearer, a.finance.sharedCostFraction)
  const acts: ActivityKey[] = a.activities.length ? a.activities : (['agroforestry', 'manure', 'soil', 'pasture'] as ActivityKey[]).filter((k) => a.mitigation.byActivity[k].mid > 0)
  const notMeasured = Object.values(village.fields).some((f) => f.provenance === 'assumption')
  const place = [village.block, village.district, village.state].filter(Boolean).join(', ')
  const date = new Date().toLocaleDateString(`${lang}-IN`, { day: 'numeric', month: 'long', year: 'numeric' })
  const exitKey: TKey = usingOffer ? (`brief.exit.${offer.exit}` as TKey) : 'brief.exit.unknown'
  const neg = (x: number) => (x < 0 ? '#a8441a' : '#1a3300')

  const download = async () => {
    if (!ref.current) return
    setPdf('busy')
    try {
      const { exportElementToPdf } = await import('../lib/exportPdf')
      await exportElementToPdf(ref.current, `gram-sabha-brief-${village.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${lang}.pdf`)
      setPdf('idle')
    } catch (e) {
      console.error(e)
      setPdf('fail')
    }
  }

  return (
    <article>
      <div className="no-print">
        <PageHeader kicker={tApp('brief.kicker')} title={tApp('brief.title')} lede={tApp('brief.lede')} step={[8, 8]} art="gram-sabha" artWide />
        <div className="flex flex-wrap items-end gap-4 mb-3">
          <Seg<Lang> legend={tApp('brief.lang')} value={lang} onChange={setLang} options={LANGS.map((l) => ({ value: l.code, label: l.name }))} />
          <button type="button" className="btn" onClick={() => window.print()}>
            {tApp('brief.print')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={download} disabled={pdf === 'busy'}>
            {pdf === 'busy' ? tApp('brief.preparing') : tApp('brief.download')}
          </button>
        </div>
        <p className="small muted mb-2" role="status">
          {pdf === 'fail' ? <span className="neg">{tApp('brief.failed')}</span> : tApp('brief.printTip')}
        </p>
      </div>

      {/* The brief itself. Plain hex colours only, no letter-spacing — see lib/exportPdf.ts. */}
      <div className="overflow-x-auto mt-4 flex justify-center py-6 px-4 bg-paper-2 rounded-[18px] border border-rule">
        <div
          ref={ref}
          lang={lang}
          className="brief shadow-sm"
          style={{ width: '794px', maxWidth: 'none', background: '#ffffff', color: '#1a3300', padding: '34px 38px', border: '1px solid #e2dccb', fontSize: '15px', lineHeight: 1.5 }}
        >
          <header style={{ borderBottom: '3px solid #1a3300', paddingBottom: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12.5, color: '#3a4a28' }}>
              <span>VASUDHA CO₂</span>
              <span>{t('brief.date', { date })}</span>
            </div>
            <h1 style={{ fontSize: 26, margin: '6px 0 2px' }}>{t('brief.h')}</h1>
            <p style={{ fontSize: 17, fontWeight: 600 }}>{t('brief.for', { name: lang === 'hi' ? village.nameHi : village.name, place })}</p>
          </header>

          <section style={{ border: '2px solid #1a3300', padding: '10px 14px', marginBottom: 14 }}>
            <p style={{ fontSize: 12.5, color: '#3a4a28' }}>{t('brief.verdictPrefix')}</p>
            <p style={{ fontSize: 21, fontWeight: 700, fontFamily: 'var(--font-serif)' }}>{t(`verdict.${a.verdict}.title` as TKey)}</p>
            <p>{t(`verdict.${a.verdict}.body` as TKey)}</p>
          </section>

          <section style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>{t('brief.income')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid #1a3300' }}>
              {[
                [t('brief.perHH'), inrRange(perHH, lang), perHH.mid],
                [t('brief.perYear'), inrRange(net, lang), net.mid],
                [t('brief.overContract', { n: years }), inrRange(total, lang), total.mid],
              ].map(([label, value, mid], i) => (
                <div key={i} style={{ padding: '8px 10px', borderLeft: i ? '1px solid #1a3300' : 'none' }}>
                  <div style={{ fontSize: 12.5, color: '#3a4a28' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: neg(mid as number) }}>{value}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: '#3a4a28', marginTop: 4 }}>
              {t('brief.rangeNote')} {usingOffer ? t('brief.offerUsed', { date: state.offerCheckedAt ?? '', share: offer.communitySharePct, years }) : t('brief.noOffer')}
            </p>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, marginBottom: 2 }}>{t('brief.costs')}</h2>
              <p>
                {villageCost > 0
                  ? t('brief.costsBody', { amount: inr(villageCost, lang), who: t(`brief.who.${bearer}` as TKey) })
                  : t('brief.costsNone')}
              </p>
              <h2 style={{ fontSize: 16, margin: '8px 0 2px' }}>{t('brief.duration')}</h2>
              <p>{t('app.years', { n: years })}</p>
              <h2 style={{ fontSize: 16, margin: '8px 0 2px' }}>{t('brief.exit')}</h2>
              <p>{t(exitKey)}</p>
            </div>
            <div>
              <h2 style={{ fontSize: 16, marginBottom: 2 }}>{t('brief.obligations')}</h2>
              <ul style={{ paddingLeft: 18, listStyle: 'disc' }}>
                {acts.map((k) => (
                  <li key={k}>{t(`brief.ob.${k}` as TKey)}</li>
                ))}
                <li>{t('brief.ob.general')}</li>
              </ul>
            </div>
          </section>

          <section style={{ background: '#fff5b8', borderLeft: '5px solid #e8c930', padding: '8px 12px', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, marginBottom: 4 }}>{t('brief.checklist')}</h2>
            <ol style={{ paddingLeft: 0, listStyle: 'none' }}>
              {(['brief.q1', 'brief.q2', 'brief.q3'] as TKey[]).map((k, i) => (
                <li key={k} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '1.5px solid #1a3300', flexShrink: 0, marginTop: 3 }} aria-hidden="true" />
                  <span>
                    <strong>{i + 1}.</strong> {t(k)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, marginBottom: 2 }}>{t('brief.women')}</h2>
            <p style={{ marginBottom: 2 }}>{t('brief.womenIntro')}</p>
            <ul style={{ paddingLeft: 18, listStyle: 'disc', marginBottom: 4 }}>
              {acts.map((k) => (
                <li key={k}>{t(`brief.w.${k}` as TKey)}</li>
              ))}
            </ul>
            <p style={{ fontWeight: 600 }}>{t('brief.womenPrompt')}</p>
          </section>

          <footer style={{ borderTop: '1px solid #1a3300', paddingTop: 8, display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 12.5, color: '#3a4a28' }}>
            <div style={{ flex: 1 }}>
              <p>{t('brief.dataNote', { score: a.confidence.overall, level: t(`conf.${a.confidence.level}` as TKey) })}</p>
              {notMeasured && <p style={{ color: '#a8441a', fontWeight: 600 }}>{t('brief.illustrativeWarn')}</p>}
              <p style={{ fontWeight: 600, color: '#1a3300', marginTop: 4 }}>{t('app.disclaimer')}</p>
              <p style={{ marginTop: 4, wordBreak: 'break-all' }}>
                {t('brief.link')} {window.location.origin}
              </p>
            </div>
            <div style={{ textAlign: 'center', width: '36mm' }}>
              <Qr text={url} label={t('brief.scan')} />
              <div>{t('brief.scan')}</div>
            </div>
          </footer>
        </div>
      </div>
    </article>
  )
}
