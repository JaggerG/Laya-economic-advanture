import Data from "../model/index";
import userInfo from "../model/userInfo";

// 定义卡牌池
const cardPool = Data.Cards;

// 纯随机概率抽取
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
 *
 * @param total
 * @param atLeast
 * @returns 卡牌信息
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
 *
 * @param min 最小值
 * @param max 最大值
 * @return  科学点数
 */
const drawSciencePoint = (min: number, max: number) => {
  // 科学点数
  const sciencePoint = getRandomInt(min, max);
  return sciencePoint;
};

/**
 *
 * @param min 最小
 * @param max 最大
 * @returns 范围内的数
 */
const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 收集卡牌
 * @param cardInfo 卡牌信息
 * @returns 返回去重卡牌数据（动画用）
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

export default {
  drawSciencePoint,
  drawCard,
  getRandomInt,
  collectCard,
};
