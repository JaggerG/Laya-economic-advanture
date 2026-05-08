import Decimal from "decimal.js";

Decimal.set({ precision: 100 });

const UNITS = ["", "K", "M", "B", "T"];
const EXTRA_UNITS = [
  "AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH", "II", "JJ",
  "KK", "LL", "MM", "NN", "OO", "PP", "QQ", "RR", "SS", "TT",
  "UU", "VV", "WW", "XX", "YY", "ZZ",
];

export function formatNumber(value: string | number | Decimal): string {
  let num: Decimal;
  if (value instanceof Decimal) {
    num = value;
  } else {
    num = new Decimal(value.toString());
  }

  if (num.isZero()) return "0";
  if (num.lt(1000)) return num.toFixed(0);

  let unitIndex = 0;
  let temp = num;
  const maxIndex = UNITS.length + EXTRA_UNITS.length - 1;

  while (temp.gte(1000) && unitIndex < maxIndex) {
    temp = temp.dividedBy(1000);
    unitIndex++;
  }

  const unit = unitIndex < UNITS.length
    ? UNITS[unitIndex]
    : EXTRA_UNITS[unitIndex - UNITS.length];

  return `${temp.toFixed(2)}${unit}`;
}

export function add(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).add(new Decimal(b.toString())).toString();
}

export function sub(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).sub(new Decimal(b.toString())).toString();
}

export function mul(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).mul(new Decimal(b.toString())).toString();
}

export function div(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).div(new Decimal(b.toString())).toString();
}

export function floorDiv(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).div(new Decimal(b.toString())).toDP(0, Decimal.ROUND_DOWN).toString();
}

export function gt(a: string | number, b: string | number): boolean {
  return new Decimal(a.toString()).gt(new Decimal(b.toString()));
}

export function gte(a: string | number, b: string | number): boolean {
  return new Decimal(a.toString()).gte(new Decimal(b.toString()));
}

export function lt(a: string | number, b: string | number): boolean {
  return new Decimal(a.toString()).lt(new Decimal(b.toString()));
}

export function lte(a: string | number, b: string | number): boolean {
  return new Decimal(a.toString()).lte(new Decimal(b.toString()));
}

export function min(values: (string | number)[]): string {
  let result = new Decimal(values[0].toString());
  for (let i = 1; i < values.length; i++) {
    const cur = new Decimal(values[i].toString());
    if (cur.lt(result)) result = cur;
  }
  return result.toString();
}
