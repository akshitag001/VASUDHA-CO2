import { ACVA_LISTED, DATASETS } from '../data/regulatory'
import type { TKey } from '../i18n'
import { useApp } from '../state/AppState'
import { PageHeader } from '../ui/bits'

export default function DataSources() {
  const { t, analysis } = useApp()
  const c = analysis?.confidence
  return (
    <article>
      <PageHeader kicker={t('data.kicker')} title={t('data.title')} lede={t('data.lede')} />

      <div className="table-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th scope="col">{t('data.colName')}</th>
              <th scope="col">{t('data.colUse')}</th>
              <th scope="col">{t('data.colStatus')}</th>
              <th scope="col">{t('data.colYear')}</th>
              <th scope="col">{t('data.colLicence')}</th>
            </tr>
          </thead>
          <tbody>
            {DATASETS.map((d) => (
              <tr key={d.id}>
                <th scope="row">
                  <a href={d.url} target="_blank" rel="noreferrer">
                    {d.name}
                  </a>
                </th>
                <td className="small" lang="en">
                  {d.use}
                </td>
                <td>
                  <span
                    className={`prov ${d.status === 'live' ? 'prov-dataset' : d.status === 'planned' ? 'prov-assumption' : 'prov-input'}`}
                    style={{ cursor: 'default' }}
                  >
                    {t(`data.status.${d.status}` as TKey)}
                  </span>
                </td>
                <td className="small">{d.year}</td>
                <td className="small">
                  {d.licence}{' '}
                  {!d.licenceVerified && (
                    <span className="verify" title={t('prov.verifyTip')}>
                      {t('prov.verify')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="section">
        <h2 className="section-title mb-2">{t('data.confTitle')}</h2>
        <p className="text-ink-2 max-w-3xl">{t('data.confBody')}</p>
        {c && (
          <p className="note mt-4">
            {t('data.confNow', { score: c.overall, village: c.village, science: c.science, money: c.money })}
          </p>
        )}
      </section>

      <section className="section" lang="en">
        <h2 className="section-title mb-2">Accredited verification agencies (ACVAs)</h2>
        <p className="text-ink-2 mb-3">
          The previous version of this tool listed the agencies below as accredited under CCTS, with validity dates. Neither the accreditation nor the dates could be
          verified, so the dates have been removed. Check the current list on the BEE website.
        </p>
        <ul className="border-t border-ink">
          {ACVA_LISTED.map((n) => (
            <li key={n} className="border-b border-rule py-2 flex justify-between gap-3">
              <span>{n}</span>
              <span className="verify">{t('prov.verify')}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
