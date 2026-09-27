import React from 'react';

type ChartItem = { label: string; value: number; color: string };
const number = (value: number) => value.toLocaleString('th-TH');
const safeValue = (value: number) => Number.isFinite(value) && value > 0 ? value : 0;

export function DonutChart({ title, items }: { title: string; items: ChartItem[] }) {
  const values = items.map(item => safeValue(item.value));
  const total = values.reduce((sum, value) => sum + value, 0);
  const radius = 42, circumference = 2 * Math.PI * radius;
  let offset = 0;
  return <figure className="dashboard-chart"><figcaption>{title}</figcaption>
    {total ? <div className="dashboard-donut-layout"><svg className="dashboard-donut" viewBox="0 0 120 120" role="img" aria-label={`${title}: ทั้งหมด ${number(total)}`}>
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e8edf4" strokeWidth="14"/>
      {items.map((item, index) => {
        const length = values[index] / total * circumference;
        const segment = <circle key={item.label} cx="60" cy="60" r={radius} fill="none" stroke={item.color} strokeWidth="14" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" tabIndex={values[index] ? 0 : undefined}><title>{`${item.label}: ${number(values[index])}`}</title></circle>;
        offset += length;
        return segment;
      })}
      <text x="60" y="56" textAnchor="middle" className="dashboard-donut-total">{number(total)}</text>
      <text x="60" y="72" textAnchor="middle" className="dashboard-donut-caption">ทั้งหมด</text>
    </svg><ul className="dashboard-chart-legend">{items.map((item, index) => <li key={item.label} title={`${item.label}: ${number(values[index])}`}><span className="dashboard-swatch" style={{ backgroundColor: item.color }}/><span>{item.label}</span><strong>{number(values[index])}</strong></li>)}</ul></div> : <p className="dashboard-chart-empty">ยังไม่มีข้อมูลสำหรับกราฟ</p>}
  </figure>;
}

export function StatusBarChart({ title, items }: { title: string; items: ChartItem[] }) {
  const values = items.map(item => safeValue(item.value));
  const max = Math.max(...values, 0);
  return <figure className="dashboard-chart"><figcaption>{title}</figcaption>
    {max ? <div className="dashboard-bars">{items.map((item, index) => <div className="dashboard-bar-row" key={item.label} title={`${item.label}: ${number(values[index])}`}>
      <span className="dashboard-bar-label">{item.label}</span><div className="dashboard-bar-track" role="img" aria-label={`${item.label}: ${number(values[index])}`}><span className="dashboard-bar-fill" style={{ width: `${values[index] / max * 100}%`, backgroundColor: item.color }}/></div><strong>{number(values[index])}</strong>
    </div>)}</div> : <p className="dashboard-chart-empty">ยังไม่มีข้อมูลสำหรับกราฟ</p>}
  </figure>;
}
