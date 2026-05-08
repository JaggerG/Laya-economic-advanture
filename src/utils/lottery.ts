/**
 * 抽奖/抽卡工具模块
 * 提供游戏中的随机抽卡、科学点数抽取、卡牌收集等功能
 * 采用权重随机算法实现卡牌的稀有度控制
 * 
 * 核心功能：
 * - 基于权重的卡牌随机抽取
 * - 指定范围内的随机整数生成
 * - 卡牌去重收集和玩家卡牌库更新
 */

import Data from "../model/index";
import userInfo from "../model/userInfo";

/** 卡牌池，引用自游戏静态配置 */
const cardPool = Data.Cards;

/**
 * 基于权重的纯随机抽卡函数
 * @param cards - 卡牌数组，每张卡牌需包含 weight 属性
 * @returns 随机选中的单张卡牌
 * 
 * 算法说明：
 * 1. 计算所有卡牌的权重总和
 * 2. 生成 [0, totalWeight) 范围内的随机数
 * 3. 遍历卡牌数组，依次减去每张卡牌的权重
 * 4. 当随机数小于等于0时，返回当前卡牌
 * 权重越大的卡牌被抽中的概率越高
 */
function pureRandomDraw(cards: any) {
  const totalWeight = cards.reduce(
    (acc: any, card: any) => acc + (card.weight || 1),
    0
  );
  let randomValue = Math.random() * totalWeight;
  for (let card of cards) {
    randomValue -= card.weight || 1;
    if (randomValue <= 0) return card;
  }
  throw new Error("No card selected");
}

// for (let i = 0; i < 10; i++) {
//   console.log(pureRandomDraw(cardPool));
// }

/**
 * 批量抽卡函数
 * @param total - 基础抽卡次数
 * @param atLeast - 保底抽卡次数（额外抽取）
 * @returns 抽中的卡牌信息数组
 * 
 * 逻辑说明：
 * 先执行 total 次基础抽取，再执行 atLeast 次保底抽取，
 * 确保玩家至少获得 atLeast 张卡牌
 */
const drawCard = (total: number, atLeast: number) => {
  // 卡片信息
  let cardInfo = [];
  for (let i = 0; i < total; i++) {
    cardInfo.push(pureRandomDraw(cardPool));
  }
  for (let i = 0; i < atLeast; i++) {
    cardInfo.push(pureRandomDraw(cardPool));
  }
  return cardInfo;
};

/**
 * 抽取科学点数
 * @param min - 最小值
 * @param max - 最大值
 * @returns 范围内的随机科学点数
 */
const drawSciencePoint = (min: number, max: number) => {
  // 科学点数
  const sciencePoint = getRandomInt(min, max);
  return sciencePoint;
};

/**
 * 生成指定范围内的随机整数（包含边界值）
 * @param min - 最小值
 * @param max - 最大值
 * @returns [min, max] 范围内的随机整数
 */
const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 收集卡牌并更新玩家卡牌库
 * @param cardInfo - 抽中的卡牌信息数组
 * @returns 去重后的卡牌数据（用于动画展示）
 * 
 * 处理逻辑：
 * 1. 将抽中的卡牌按名称去重，统计每种卡牌的数量（用于动画展示）
 * 2. 更新玩家卡牌库 userInfo.Card：
 *    - 如果卡牌已存在，增加 has_amount
 *    - 如果卡牌不存在，初始化 level 为 0，has_amount 为 1，并加入卡牌库
 */
const collectCard = (cardInfo: any) => {
  let card_info_arr: any = [];
  cardInfo.forEach((cardInfo: any) => {
    // card_info_arr
    const arr_idx = card_info_arr.findIndex(
      (cardItem: any) => cardItem.name === cardInfo.name
    );
    if (arr_idx !== -1) {
      (card_info_arr[arr_idx] as any).has_amount++;
    } else {
      card_info_arr.push(cardInfo);
    }
    // Card Collect
    const idx = userInfo.Card.findIndex(
      (carditem: any) => carditem.name === cardInfo.name
    );
    if (idx !== -1) {
      (userInfo.Card[idx] as any).has_amount += 1;
    } else {
      cardInfo.has_amount = 1;
      cardInfo.level = 0;
      userInfo.Card.push(cardInfo);
    }
  });
  return card_info_arr;
};

/**
 * 导出抽奖相关函数
 */
export default {
  drawSciencePoint,
  drawCard,
  getRandomInt,
  collectCard,
};
