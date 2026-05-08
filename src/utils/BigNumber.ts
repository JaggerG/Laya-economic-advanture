/**
 * 大数运算工具模块
 * 基于 decimal.js 库提供高精度的大数运算支持
 * 游戏中资产数量可能达到极大数值（超过 JavaScript 安全整数范围），因此需要专门的大数处理
 * 
 * 功能包括：
 * - 大数的加减乘除和取整除法
 * - 数值比较（大于、大于等于、小于、小于等于）
 * - 数组求最小值
 * - 带单位（K/M/B/T/AA-ZZ）的格式化显示
 */

import Decimal from "decimal.js";

/** 设置 decimal.js 的运算精度为100位，确保超大数值的精确计算 */
Decimal.set({ precision: 100 });

/** 基础单位数组，用于1000的幂次表示（千、百万、十亿、万亿） */
const UNITS = ["", "K", "M", "B", "T"];

/** 扩展单位数组，用于超过万亿后的双字母表示（AA-ZZ） */
const EXTRA_UNITS = [
  "AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH", "II", "JJ",
  "KK", "LL", "MM", "NN", "OO", "PP", "QQ", "RR", "SS", "TT",
  "UU", "VV", "WW", "XX", "YY", "ZZ",
];

/**
 * 将数值格式化为带单位的字符串表示
 * @param value - 待格式化的数值，支持 string、number 或 Decimal 类型
 * @returns 格式化后的字符串，如 "1.50K"、"2.30M"、"1.50AA"
 * 
 * 格式化规则：
 * - 0 返回 "0"
 * - 小于1000的数值直接返回整数形式
 * - 大于等于1000的数值按每1000一个量级递进，附加对应单位
 */
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

/**
 * 大数加法
 * @param a - 被加数
 * @param b - 加数
 * @returns 两数之和的字符串表示
 */
export function add(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).add(new Decimal(b.toString())).toString();
}

/**
 * 大数减法
 * @param a - 被减数
 * @param b - 减数
 * @returns 两数之差的字符串表示
 */
export function sub(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).sub(new Decimal(b.toString())).toString();
}

/**
 * 大数乘法
 * @param a - 被乘数
 * @param b - 乘数
 * @returns 两数之积的字符串表示
 */
export function mul(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).mul(new Decimal(b.toString())).toString();
}

/**
 * 大数除法
 * @param a - 被除数
 * @param b - 除数
 * @returns 两数之商的字符串表示
 */
export function div(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).div(new Decimal(b.toString())).toString();
}

/**
 * 大数向下取整除法
 * @param a - 被除数
 * @param b - 除数
 * @returns 商的向下取整字符串表示
 */
export function floorDiv(a: string | number, b: string | number): string {
  return new Decimal(a.toString()).div(new Decimal(b.toString())).toDP(0, Decimal.ROUND_DOWN).toString();
}

/**
 * 大数比较：大于
 * @param a - 左操作数
 * @param b - 右操作数
 * @returns a 是否大于 b
 */
export function gt(a: string | number, b: string | number): boolean {
  return new Decimal(a.toString()).gt(new Decimal(b.toString()));
}

/**
 * 大数比较：大于等于
 * @param a - 左操作数
 * @param b - 右操作数
 * @returns a 是否大于等于 b
 */
export function gte(a: string | number, b: string | number): boolean {
  return new Decimal(a.toString()).gte(new Decimal(b.toString()));
}

/**
 * 大数比较：小于
 * @param a - 左操作数
 * @param b - 右操作数
 * @returns a 是否小于 b
 */
export function lt(a: string | number, b: string | number): boolean {
  return new Decimal(a.toString()).lt(new Decimal(b.toString()));
}

/**
 * 大数比较：小于等于
 * @param a - 左操作数
 * @param b - 右操作数
 * @returns a 是否小于等于 b
 */
export function lte(a: string | number, b: string | number): boolean {
  return new Decimal(a.toString()).lte(new Decimal(b.toString()));
}

/**
 * 求数组中的最小值
 * @param values - 数值数组，元素类型为 string 或 number
 * @returns 最小值的字符串表示
 */
export function min(values: (string | number)[]): string {
  let result = new Decimal(values[0].toString());
  for (let i = 1; i < values.length; i++) {
    const cur = new Decimal(values[i].toString());
    if (cur.lt(result)) result = cur;
  }
  return result.toString();
}
