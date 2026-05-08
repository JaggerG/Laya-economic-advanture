import Data from "../model/index";
import userInfo from "../model/userInfo";
import * as BN from "./BigNumber";
import EventManager from "./EventManager";

const SAVE_KEY = "laya_economic_adventure_save";

export interface IAssetChildSave {
  name: string;
  amount: string;
  level: number;
  bonus: any;
}

export interface IAssetSave {
  name: string;
  amount: string;
  child: IAssetChildSave[];
}

export interface IEmployeeSave {
  time: number;
  amount: string;
  produce_per_sec: string;
}

export interface ITaskSave {
  task_level: number;
  task_progress: number;
  task_idx_max: number;
  task_idx_config: { idx: number; step: number }[];
  task_step: number;
}

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

export interface IGameSaveData {
  version: number;
  timestamp: number;
  level: number;
  science_point: number;
  assets: IAssetSave[];
  employee: IEmployeeSave;
  task: ITaskSave;
  cards: ICardSave[];
}

export interface IOfflineResult {
  offlineSeconds: number;
  earnings: Map<string, string>;
  multiplier: number;
}

export class GameDataManager {
  private static instance: GameDataManager;

  static getInstance(): GameDataManager {
    if (!GameDataManager.instance) {
      GameDataManager.instance = new GameDataManager();
    }
    return GameDataManager.instance;
  }

  save(): void {
    const saveData: IGameSaveData = {
      version: 1,
      timestamp: Date.now(),
      level: userInfo.level,
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

  restore(saveData: IGameSaveData): void {
    userInfo.level = saveData.level;
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

  hasSave(): boolean {
    return !!localStorage.getItem(SAVE_KEY);
  }

  clearSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}
