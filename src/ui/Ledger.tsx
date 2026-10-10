import type { FinanceInput, ScenarioResult } from '../engine'
import { bearerFraction } from '../engine'
import { inr, num, pct } from '../lib/format'
import { useApp } from '../state/AppState'

// The central case written out like an account book, line by line.
export function Ledger({ r, input, caption }: { r: ScenarioResult; input: FinanceInput; caption: string }) {
  const { t, lang } = useApp()
  const share = bearerFraction(input.costBearer, input.sharedCostFraction)
  const neg = (x: number) => (x === 0 ? inr(0, lang) : `− ${inr(x, lang)}`)
  return (
    <div className="table-wrap">
      <table className="ledger">
        <caption className="text-left font-semibold mb-2 serif text-lg">{caption}</caption>
        <tbody>
          <tr>
            <td>
              {t('money.row.gross')}
              <span className="block small muted">
                {t('money.ledger.credits', { credits: num(r.credits), price: `${inr(r.price, lang)}` })}
              </span>
            </td>
            <td className="amt">{inr(r.gross, lang)}</td>
          </tr>
          <tr>
            <td>
              {t('money.row.aggCut')} ({pct(input.aggregatorShare)})
            </td>
            <td className="amt neg">{neg(r.aggregatorCut)}</td>
          </tr>
          <tr className="sub">
            <td className="pl-5">{t('money.ledger.validation')}</td>
            <td className="amt">{inr(r.costs.validation, lang)}</td>
          </tr>
          <tr className="sub">
            <td className="pl-5">{t('money.ledger.registration')}</td>
            <td className="amt">{inr(r.costs.registration, lang)}</td>
          </tr>
          <tr className="sub">
            <td className="pl-5">{t('money.ledger.verification')}</td>
            <td className="amt">{inr(r.costs.verification, lang)}</td>
          </tr>
          <tr className="sub">
            <td className="pl-5">{t('money.ledger.monitoring')}</td>
            <td className="amt">{inr(r.costs.monitoring, lang)}</td>
          </tr>
          <tr>
            <td>
              {t('money.row.costs')}
              <span className="block small muted">{t('money.ledger.villageShare', { pct: pct(share) })}</span>
            </td>
            <td className="amt neg">{neg(r.costsToVillage)}</td>
          </tr>
          <tr className="total">
            <td>{t('money.row.net')}</td>
            <td className={`amt ${r.net < 0 ? 'neg' : ''}`}>{inr(r.net, lang)}</td>
          </tr>
          <tr>
            <td>
              {t('money.row.netHH')} <span className="small muted">(÷ {num(input.households)})</span>
            </td>
            <td className={`amt ${r.netPerHousehold < 0 ? 'neg' : ''}`}>{inr(r.netPerHousehold, lang)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
