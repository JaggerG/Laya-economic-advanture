/**
 * 游戏数据管理模块
 * 负责游戏存档的保存、读取、恢复，以及离线收益的计算和应用
 * 采用单例模式确保全局唯一的数据管理入口
 * 
 * 核心功能：
 * - 游戏数据的本地存储（localStorage）
 * - 离线期间收益的计算（基于存档时间戳和当前时间的差值）
 * - 离线收益的应用和事件派发
 * - 任务状态的离线后校验
 */

import Data from "../model/index";
import userInfo from "../model/userInfo";
import * as BN from "./BigNumber";
import EventManager from "./EventManager";

/** localStorage 中存档数据的键名 */
const SAVE_KEY = "laya_economic_adventure_save";

/**
 * 子资产存档数据接口
 * 记录子资产的名称、数量、等级和加成信息
 */
export interface IAssetChildSave {
  name: string;
  amount: string;
  level: number;
  bonus: any;
}

/**
 * 父资产存档数据接口
 * 记录父资产的名称、数量和所有子资产的存档状态
 */
export interface IAssetSave {
  name: string;
  amount: string;
  child: IAssetChildSave[];
}

/**
 * 员工存档数据接口
 * 记录员工的生产周期、数量和每秒产出
 */
export interface IEmployeeSave {
  time: number;
  amount: string;
  produce_per_sec: string;
}

/**
 * 任务存档数据接口
 * 记录任务的等级、进度、索引配置和步数
 */
export interface ITaskSave {
  task_level: number;
  task_progress: number;
  task_idx_max: number;
  task_idx_config: { idx: number; step: number }[];
  task_step: number;
}

/**
 * 卡牌存档数据接口
 * 记录卡牌的完整信息，包括等级、数量等动态属性
 */
export interface ICardSave {
  name: string;
  imgUrl: string;
  type: string;
  related_assets: string;
  level_ratio: number;
  level_require: number;
  level: number;
  origin_ratio: number;
  cost: number;
  weight: number;
  has_amount: number;
}

/**
 * 完整游戏存档数据接口
 * 包含版本号、时间戳和所有游戏状态数据
 */
export interface IGameSaveData {
  version: number;
  timestamp: number;
  level: number;
  exp: number;
  science_point: number;
  assets: IAssetSave[];
  employee: IEmployeeSave;
  task: ITaskSave;
  cards: ICardSave[];
}

/**
 * 离线收益计算结果接口
 * 包含离线时长、收益明细和收益倍率
 */
export interface IOfflineResult {
  offlineSeconds: number;
  earnings: Map<string, string>;
  multiplier: number;
}

/**
 * 游戏数据管理类（单例模式）
 * 统一管理游戏数据的持久化和离线收益计算
 */
export class GameDataManager {
  /** 单例实例引用 */
  private static instance: GameDataManager;

  /**
   * 获取 GameDataManager 单例实例
   * @returns GameDataManager 的唯一实例
   */
  static getInstance(): GameDataManager {
    if (!GameDataManager.instance) {
      GameDataManager.instance = new GameDataManager();
    }
    return GameDataManager.instance;
  }

  /**
   * 保存游戏数据到本地存储
   * 将当前游戏状态序列化后存入 localStorage
   */
  save(): void {
    const saveData: IGameSaveData = {
      version: 1,
      timestamp: Date.now(),
      level: userInfo.level,
      exp: userInfo.exp,
      science_point: userInfo.science_point,
      assets: Data.Assets.map((asset: any) => ({
        name: asset.name,
        amount: asset.amount,
        child: asset.child.map((child: any) => ({
          name: child.name,
          amount: child.amount,
          level: child.level,
          bonus: JSON.parse(JSON.stringify(child.bonus)),
        })),
      })),
      employee: {
        time: Data.Employee.time,
        amount: Data.Employee.amount,
        produce_per_sec: Data.Employee.produce_per_sec,
      },
      task: {
        task_level: userInfo.Task.task_level,
        task_progress: userInfo.Task.task_progress,
        task_idx_max: userInfo.Task.task_idx_max,
        task_idx_config: JSON.parse(JSON.stringify(userInfo.Task.task_idx_config)),
        task_step: userInfo.Task.task_step,
      },
      cards: JSON.parse(JSON.stringify(userInfo.Card)),
    };

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error("Save game failed:", e);
    }
  }

  /**
   * 从本地存储加载游戏数据
   * @returns 解析后的游戏存档数据，如果没有存档则返回 null
   */
  load(): IGameSaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as IGameSaveData;
    } catch (e) {
      console.error("Load game failed:", e);
      return null;
    }
  }

  /**
   * 从存档数据恢复游戏状态
   * 将存档中的数据恢复到运行时数据结构中
   * @param saveData - 要恢复的存档数据
   */
  restore(saveData: IGameSaveData): void {
    userInfo.level = saveData.level;
    userInfo.exp = saveData.exp || 0;
    userInfo.science_point = saveData.science_point;

    for (let i = 0; i < Data.Assets.length && i < saveData.assets.length; i++) {
      const savedAsset = saveData.assets[i];
      const asset = Data.Assets[i];
      asset.amount = savedAsset.amount;
      for (let j = 0; j < asset.child.length && j < savedAsset.child.length; j++) {
        const savedChild = savedAsset.child[j];
        asset.child[j].amount = savedChild.amount;
        asset.child[j].level = savedChild.level;
        if (savedChild.bonus) {
          asset.child[j].bonus = savedChild.bonus;
        }
      }
    }

    Data.Employee.amount = saveData.employee.amount;
    Data.Employee.produce_per_sec = saveData.employee.produce_per_sec;

    userInfo.Task.task_level = saveData.task.task_level;
    userInfo.Task.task_progress = saveData.task.task_progress;
    userInfo.Task.task_idx_max = saveData.task.task_idx_max;
    userInfo.Task.task_idx_config = saveData.task.task_idx_config;
    userInfo.Task.task_step = saveData.task.task_step;

    if (saveData.cards && saveData.cards.length > 0) {
      userInfo.Card = saveData.cards;
    }
  }

  /**
   * 计算离线期间的收益
   * @param saveData - 存档数据，用于获取离线前的状态
   * @param multiplier - 收益倍率，默认为1（正常收益），广告双倍时为2
   * @returns 离线收益计算结果，包含离线时长和各项收益明细
   * 
   * 计算逻辑：
   * 1. 根据存档时间戳和当前时间计算离线秒数
   * 2. 离线收益上限为8小时（28800秒）
   * 3. 遍历所有子资产，根据其数量、产出、加成计算每秒产出
   * 4. 应用 Power、Speed、Chance、Bonus 等加成效果
   * 5. 累加员工的基础产出
   * 6. 乘以收益倍率得到最终收益
   */
  calculateOfflineEarnings(saveData: IGameSaveData, multiplier: number = 1): IOfflineResult {
    const now = Date.now();
    const offlineTime = now - saveData.timestamp;
    const offlineSeconds = Math.floor(offlineTime / 1000);
    const earnings = new Map<string, string>();

    if (offlineSeconds <= 0) {
      return { offlineSeconds: 0, earnings, multiplier };
    }

    const maxOfflineSeconds = 8 * 3600;
    const effectiveSeconds = Math.min(offlineSeconds, maxOfflineSeconds);

    for (let i = 0; i < saveData.assets.length; i++) {
      const savedAsset = saveData.assets[i];
      const runtimeAsset = Data.Assets[i];
      if (!runtimeAsset) continue;

      for (let j = 0; j < savedAsset.child.length; j++) {
        const savedChild = savedAsset.child[j];
        const runtimeChild = runtimeAsset.child[j];
        if (!savedChild.bonus || !runtimeChild) continue;

        const outcome = BN.mul(savedChild.amount, runtimeChild.outcome || "1");
        const powerBonus = savedChild.bonus.Power?.quantity || "1";
        const speedBonus = savedChild.bonus.Speed?.quantity || "1";
        const chanceBonus = savedChild.bonus.Chance?.quantity || "0";
        const bonusMultiplier = savedChild.bonus.Bonus?.quantity || "1";

        let producePerCycle = BN.mul(outcome, powerBonus);
        const time = BN.div((runtimeChild.time || 1).toString(), speedBonus);
        const cyclesPerSecond = BN.div("1", time);
        let producePerSecond = BN.mul(producePerCycle, cyclesPerSecond);

        const chance = parseFloat(chanceBonus);
        if (chance > 0) {
          const avgBonusMultiplier = BN.add(
            "1",
            BN.mul(BN.div(chanceBonus, "100"), BN.sub(bonusMultiplier, "1"))
          );
          producePerSecond = BN.mul(producePerSecond, avgBonusMultiplier);
        }

        let totalProduce = BN.mul(producePerSecond, effectiveSeconds.toString());
        if (multiplier !== 1) {
          totalProduce = BN.mul(totalProduce, multiplier.toString());
        }

        if (runtimeChild.produce === "Parent") {
          const key = savedAsset.name;
          const current = earnings.get(key) || "0";
          earnings.set(key, BN.add(current, totalProduce));
        } else {
          const key = savedAsset.name + "_" + runtimeChild.produce;
          const current = earnings.get(key) || "0";
          earnings.set(key, BN.add(current, totalProduce));
        }
      }
    }

    let employeeProduce = BN.mul(saveData.employee.produce_per_sec, effectiveSeconds.toString());
    if (multiplier !== 1) {
      employeeProduce = BN.mul(employeeProduce, multiplier.toString());
    }
    const currentEmployee = earnings.get("Employee") || "0";
    earnings.set("Employee", BN.add(currentEmployee, employeeProduce));

    return { offlineSeconds, earnings, multiplier };
  }

  /**
   * 将离线收益应用到游戏数据中
   * 根据收益键名解析目标资产并累加数量
   * @param result - 离线收益计算结果
   */
  applyOfflineEarnings(result: IOfflineResult): void {
    for (const [key, value] of result.earnings) {
      if (key === "Employee") {
        Data.Employee.amount = BN.add(Data.Employee.amount, value);
        continue;
      }

      const asset = Data.Assets.find((a: any) => a.name === key);
      if (asset) {
        asset.amount = BN.add(asset.amount, value);
        continue;
      }

      const parts = key.split("_");
      if (parts.length === 2) {
        const parentAsset = Data.Assets.find((a: any) => a.name === parts[0]);
        if (parentAsset) {
          const child = parentAsset.child.find((c: any) => c.name === parts[1]);
          if (child) {
            child.amount = BN.add(child.amount, value);
          }
        }
      }
    }
  }

  /**
   * 派发离线收益相关的事件通知
   * 触发 UI 更新事件，使界面显示离线收益后的最新状态
   * @param result - 离线收益计算结果
   */
  emitOfflineEarningsEvents(result: IOfflineResult): void {
    for (const [key, value] of result.earnings) {
      if (key === "Employee") {
        EventManager.getInstance().Emit("updateEmployeeLabel", []);
        continue;
      }

      const asset = Data.Assets.find((a: any) => a.name === key);
      if (asset) {
        EventManager.getInstance().Emit("updateParentLabel", [Data.Assets.indexOf(asset)]);
        EventManager.getInstance().Emit(asset.name + "_COLLECT_update", [value]);
        continue;
      }

      const parts = key.split("_");
      if (parts.length === 2) {
        const parentAsset = Data.Assets.find((a: any) => a.name === parts[0]);
        if (parentAsset) {
          const child = parentAsset.child.find((c: any) => c.name === parts[1]);
          if (child) {
            EventManager.getInstance().Emit("updateChildLabel" + child.name, []);
            EventManager.getInstance().Emit(child.name + "_COLLECT_update", [value]);
          }
        }
      }
    }
  }

  /**
   * 离线恢复后检查 OWN 类型任务的完成状态
   * 离线期间资产数量可能已满足任务目标，需要触发更新事件
   */
  checkOwnTasksAfterOffline(): void {
    const taskConfig = Data.Tasks[userInfo.Task.task_level];
    if (!taskConfig) return;

    for (let i = 0; i < userInfo.Task.task_idx_config.length; i++) {
      const taskIdx = userInfo.Task.task_idx_config[i].idx;
      const config = taskConfig.config[taskIdx];
      if (!config || config.type !== "OWN") continue;

      let targetAsset: any = null;
      const targetAssetName = config.target_asset;

      for (const asset of Data.Assets) {
        if (asset.name === targetAssetName) {
          targetAsset = asset;
          break;
        }
        for (const child of asset.child) {
          if (child.name === targetAssetName) {
            targetAsset = child;
            break;
          }
        }
        if (targetAsset) break;
      }

      if (targetAsset) {
        EventManager.getInstance().Emit(targetAsset.name + "_update", []);
      }
    }
  }

  /**
   * 检查是否存在存档数据
   * @returns 如果 localStorage 中存在存档则返回 true
   */
  hasSave(): boolean {
    return !!localStorage.getItem(SAVE_KEY);
  }

  /**
   * 清除本地存档数据
   */
  clearSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}
