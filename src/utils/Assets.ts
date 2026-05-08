import Data from "../model/index";
import * as BN from "./BigNumber";

const produce_sec_sum = (parent_idx: number, child_idx: number) => {
  const config = Data.Assets[parent_idx].child[child_idx];
  const outcome = BN.mul(config.outcome, config.bonus.Power.quantity);
  const time = BN.div(config.time, config.bonus.Speed.quantity);
  const sum = BN.div(BN.mul(config.amount, outcome), time);
  return BN.formatNumber(sum);
};

const can_buy_sum = (parent_idx: number, child_idx: number) => {
  const config = Data.Assets[parent_idx].child[child_idx];
  const parent = Data.Assets[parent_idx];
  let cost_num: string[] = [];
  config.cost.forEach((item: any) => {
    let target_amount: string;
    if (item.name === "Parent") {
      target_amount = parent.amount;
    } else if (item.name === "Employee") {
      target_amount = Data.Employee.amount;
    } else {
      target_amount = parent.child[child_idx - 1].amount;
    }
    target_amount = BN.div(target_amount, config.bonus['Discount'].quantity);
    const quantity = BN.floorDiv(target_amount, item.quantity);
    cost_num.push(quantity);
  });
  return BN.min(cost_num);
};

const calculateNextLevelCost = (parent_idx: number, child_idx: number): string => {
  const config = Data.Assets[parent_idx].child[child_idx];
  const currentAmount = parseInt(config.amount);
  const currentLevel = config.level || 1;

  const levelThresholds = [10, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

  let nextLevelTarget = -1;
  for (const threshold of levelThresholds) {
    if (currentAmount < threshold) {
      nextLevelTarget = threshold;
      break;
    }
  }

  if (nextLevelTarget === -1) {
    return can_buy_sum(parent_idx, child_idx);
  }

  const needToBuy = nextLevelTarget - currentAmount;
  const maxCanBuy = can_buy_sum(parent_idx, child_idx);

  if (BN.gt(needToBuy.toString(), maxCanBuy)) {
    return maxCanBuy;
  }

  return needToBuy.toString();
};

const convertToUnits = BN.formatNumber;

export default {
  produce_sec_sum,
  can_buy_sum,
  calculateNextLevelCost,
  convertToUnits,
};
