import { displayDate, escHtml } from './utils.js';

export function tariffProvenanceHtml(bill) {
  const effective = bill?.tariffEffectiveFrom ? displayDate(bill.tariffEffectiveFrom) : 'Not recorded';
  const verified = bill?.tariffAsOf ? escHtml(bill.tariffAsOf) : 'Not recorded';
  const sourceUrl = bill?.tariffSourceUrl || '';
  const source = sourceUrl
    ? `<a href="${escHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escHtml(sourceUrl.replace(/^https?:\/\//, ''))}</a>`
    : 'Not recorded';
  return `
    <dl class="bill-source-meta">
      <div><dt>Tariff effective from:</dt><dd>${effective}</dd></div>
      <div><dt>Last verified:</dt><dd>${verified}</dd></div>
      <div><dt>Official source:</dt><dd>${source}</dd></div>
    </dl>`;
}
