import Data from "../model/index";
import Decimal from "decimal.js";

/**
 * 每秒生产数量
 * @param {*} parent_idx
 * @param {*} child_idx
 * @returns
 */
const produce_sec_sum = (parent_idx: number, child_idx: number) => {
  const config = Data.Assets[parent_idx].child[child_idx];
  // const time = config.outcome * config.bonus.Power.quantity;
  const outcome = new Decimal(config.outcome).mul(
    new Decimal(config.bonus.Power.quantity)
  );
  const time = config.time / config.bonus.Speed.quantity;
  // const sum = (config.amount * outcome) / time;
  const sum = new Decimal(config.amount)
    .mul(new Decimal(outcome))
    .div(new Decimal(time))
    .toString();
  return convertToUnits(sum);
};

/**
 * 获取可购买数量
 * @param {*} parent_idx
 * @param {*} child_idx
 * @returns
 */
const can_buy_sum = (parent_idx: number, child_idx: number) => {
  const config = Data.Assets[parent_idx].child[child_idx];
  const parent = Data.Assets[parent_idx];
  let cost_num: any[] = [];
  config.cost.forEach((item: any) => {
    let quantity, target_amount;
    if (item.name === "Parent") {
      target_amount = parent.amount;
    } else if (item.name === "Employee") {
      target_amount = Data.Employee.amount;
    } else {
      target_amount = parent.child[child_idx - 1].amount;
    }
    // quantity = Math.floor(target_amount / item.quantity);
    // target_amount = Math.floor(target_amount / config.bonus['Discount'].quantity);
    target_amount = new Decimal(target_amount).div(new Decimal(config.bonus['Discount'].quantity));
    quantity = new Decimal(target_amount).div(new Decimal(item.quantity)).toDP(0);
    cost_num.push(quantity);
  });
  const min_can_buy_amount = get_min(cost_num);
  return min_can_buy_amount;
};

const get_min = (data: any) => {
  let min = data[0];
  for (let i = 1; i < data.length; i++) {
    // min > data[i]
    if (new Decimal(min).gt(new Decimal(data[i]))) {
      min = data[i];
    }
  }
  return min;
};
const convertToUnits = (number: string): string => {
  Decimal.set({ precision: 100 });
  const units = ["", "K", "M", "B", "T", "Q"];
  const extraUnits = [
    "AA",
    "BB",
    "CC",
    "DD",
    "EE",
    "FF",
    "GG",
    "HH",
    "II",
    "JJ",
    "KK",
    "LL",
    "MM",
    "NN",
    "OO",
    "PP",
    "QQ",
    "RR",
    "SS",
    "TT",
    "UU",
    "VV",
    "WW",
    "XX",
    "YY",
    "ZZ",
  ];
  let unitIndex = 0;
  let num = new Decimal(number);

  while (num.gte(1000) && unitIndex < units.length + extraUnits.length - 1) {
    num = num.dividedBy(1000);
    unitIndex++;
  }
  
  if (unitIndex == 0) {
    return `${num.toFixed(0)}`
  } else if (unitIndex < units.length) {
    return `${num.toFixed(2)}${units[unitIndex]}`;
  }else {
    return `${num.toFixed(2)}${extraUnits[unitIndex - units.length]}`;
  }
};
export default {
  produce_sec_sum,
  can_buy_sum,
  convertToUnits,
};
