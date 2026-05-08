/**
 * 资产计算工具模块
 * 提供资产相关的核心计算功能，包括每秒产出计算、可购买数量计算、下一级成本计算等
 * 所有数值计算均基于 BigNumber 模块，确保大数运算的精度
 */

import Data from "../model/index";
import * as BN from "./BigNumber";

/**
 * 计算指定子资产的每秒产出总和
 * @param parent_idx - 父资产在 Assets 数组中的索引
 * @param child_idx - 子资产在父资产 child 数组中的索引
 * @returns 格式化后的每秒产出字符串
 * 
 * 计算逻辑：
 * 1. 获取基础产出量（outcome）和当前数量（amount）
 * 2. 应用 Power 加成倍率
 * 3. 应用 Speed 加成缩短生产时间
 * 4. 计算每秒产出 = (数量 × 产出量 × Power) / (时间 / Speed)
 */
const produce_sec_sum = (parent_idx: number, child_idx: number) => {
  const config = Data.Assets[parent_idx].child[child_idx];
  const outcome = BN.mul(config.outcome, config.bonus.Power.quantity);
  const time = BN.div(config.time, config.bonus.Speed.quantity);
  const sum = BN.div(BN.mul(config.amount, outcome), time);
  return BN.formatNumber(sum);
};

/**
 * 计算指定子资产当前可购买的最大数量
 * @param parent_idx - 父资产在 Assets 数组中的索引
 * @param child_idx - 子资产在父资产 child 数组中的索引
 * @returns 可购买的最大数量字符串
 * 
 * 计算逻辑：
 * 1. 遍历该子资产的 cost 配置，确定每种消耗资源的可用数量
 * 2. 消耗资源类型包括：Parent（父资产自身）、Employee（员工）、其他兄弟子资产
 * 3. 应用 Discount 加成减少消耗需求
 * 4. 取所有消耗资源中可购买数量的最小值作为结果
 */
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

/**
 * 计算升级到下一级目标所需的购买数量
 * @param parent_idx - 父资产在 Assets 数组中的索引
 * @param child_idx - 子资产在父资产 child 数组中的索引
 * @returns 需要购买的数量字符串
 * 
 * 升级阈值规则：
 * 当资产数量达到 [10, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000] 时触发等级提升
 * 如果当前数量已超过所有阈值，则返回可购买的最大数量
 */
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

/**
 * 将数值转换为带单位（K/M/B/T/AA等）的格式化字符串
 * 直接复用 BigNumber 模块的 formatNumber 函数
 */
const convertToUnits = BN.formatNumber;

/**
 * 导出资产计算相关函数
 */
export default {
  produce_sec_sum,
  can_buy_sum,
  calculateNextLevelCost,
  convertToUnits,
};
