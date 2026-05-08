/**
 * 玩家等级管理模块
 * 负责经验值管理、等级提升、卡牌解锁等核心逻辑
 *
 * 核心功能：
 * - 添加经验值并检查等级提升
 * - 获取当前等级称号和升级进度
 * - 计算当前等级解锁的卡牌列表
 * - 派发等级相关事件通知 UI 更新
 */

import EventManager from "./EventManager";
import userInfo from "../model/userInfo";
import Data from "../model/index";

/**
 * 等级管理器类（单例模式）
 * 统一管理玩家的经验值和等级系统
 */
export class LevelManager {
  /** 单例实例引用 */
  private static instance: LevelManager;

  /**
   * 获取 LevelManager 单例实例
   * @returns LevelManager 的唯一实例
   */
  static getInstance(): LevelManager {
    if (!LevelManager.instance) {
      LevelManager.instance = new LevelManager();
    }
    return LevelManager.instance;
  }

  /**
   * 添加经验值
   * @param amount - 要增加的经验值数量
   *
   * 处理逻辑：
   * 1. 增加当前经验值
   * 2. 检查是否满足升级条件
   * 3. 如果满足，执行升级并检查新解锁的卡牌
   * 4. 派发 Exp_update 事件
   * 5. 如果升级，派发 LevelUp 和 UnlockCard 事件
   */
  addExp(amount: number): void {
    userInfo.exp += amount;
    let leveledUp = false;
    const unlockedCards: string[] = [];

    while (true) {
      const nextLevel = userInfo.level + 1;
      const nextLevelConfig = Data.Player_Level_Config.find(
        (cfg: any) => cfg.level === nextLevel
      );
      if (!nextLevelConfig) break;

      if (userInfo.exp >= nextLevelConfig.exp_required) {
        userInfo.exp -= nextLevelConfig.exp_required;
        userInfo.level = nextLevel;
        leveledUp = true;

        // 检查新解锁的卡牌
        Data.Cards.forEach((card: any) => {
          if (card.level_require === nextLevel) {
            unlockedCards.push(card.name);
          }
        });
      } else {
        break;
      }
    }

    EventManager.getInstance().Emit("Exp_update", []);

    if (leveledUp) {
      EventManager.getInstance().Emit("LevelUp", [userInfo.level]);
      if (unlockedCards.length > 0) {
        EventManager.getInstance().Emit("UnlockCard", [unlockedCards]);
      }
    }
  }

  /**
   * 获取指定等级的称号
   * @param level - 玩家等级
   * @returns 等级称号，如果找不到则返回 "未知称号"
   */
  getLevelTitle(level: number): string {
    const config = Data.Player_Level_Config.find(
      (cfg: any) => cfg.level === level
    );
    return config ? config.title : "未知称号";
  }

  /**
   * 获取当前经验值进度
   * @returns 包含 current（当前经验）和 required（升级所需经验）的对象
   */
  getExpProgress(): { current: number; required: number } {
    const nextLevel = userInfo.level + 1;
    const nextLevelConfig = Data.Player_Level_Config.find(
      (cfg: any) => cfg.level === nextLevel
    );
    if (!nextLevelConfig) {
      return { current: userInfo.exp, required: userInfo.exp };
    }
    return { current: userInfo.exp, required: nextLevelConfig.exp_required };
  }

  /**
   * 获取当前等级已解锁的卡牌列表
   * @returns 已解锁卡牌的名称数组
   */
  getUnlockedCards(): string[] {
    return Data.Cards.filter(
      (card: any) => card.level_require <= userInfo.level
    ).map((card: any) => card.name);
  }
}
