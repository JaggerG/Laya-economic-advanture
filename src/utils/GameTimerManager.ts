/**
 * 游戏定时器管理模块
 * 统一管理游戏中所有需要定时更新的进度条组件
 * 采用单例模式，通过 Laya.timer 提供统一的计时驱动
 * 
 * 核心功能：
 * - 启动/停止全局计时器（每100毫秒触发一次）
 * - 注册/注销进度更新器（IProgressUpdater 接口实现者）
 * - 在每次 tick 时批量更新所有注册的进度条
 * 
 * 使用场景：
 * - 资产生产进度条（AssetItem）
 * - 员工生产进度条（Employee）
 */

/**
 * 进度更新器接口
 * 任何需要定时更新进度的组件都需要实现此接口
 */
export interface IProgressUpdater {
  /** 更新进度的方法，由 GameTimerManager 定时调用 */
  update(): void;
}

/**
 * 游戏定时器管理类（单例模式）
 * 负责协调所有进度更新器的定时刷新
 */
export class GameTimerManager {
  /** 单例实例引用 */
  private static instance: GameTimerManager;
  /** 计时器运行状态标志 */
  private isRunning: boolean = false;

  /** 已注册的进度更新器集合，使用 Set 避免重复注册 */
  private progressUpdaters: Set<IProgressUpdater> = new Set();

  /**
   * 获取 GameTimerManager 单例实例
   * @returns GameTimerManager 的唯一实例
   */
  static getInstance(): GameTimerManager {
    if (!GameTimerManager.instance) {
      GameTimerManager.instance = new GameTimerManager();
    }
    return GameTimerManager.instance;
  }

  /**
   * 启动全局计时器
   * 每100毫秒触发一次 onTick 方法，更新所有注册的进度条
   * 如果计时器已在运行，则不会重复启动
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    Laya.timer.loop(100, this, this.onTick);
  }

  /**
   * 停止全局计时器
   * 清除所有与该实例关联的定时器，并将运行状态设为 false
   */
  stop(): void {
    Laya.timer.clearAll(this);
    this.isRunning = false;
  }

  /**
   * 注册进度更新器
   * @param updater - 实现 IProgressUpdater 接口的组件实例
   */
  registerProgressUpdater(updater: IProgressUpdater): void {
    this.progressUpdaters.add(updater);
  }

  /**
   * 注销进度更新器
   * @param updater - 要移除的进度更新器实例
   */
  unregisterProgressUpdater(updater: IProgressUpdater): void {
    this.progressUpdaters.delete(updater);
  }

  /**
   * 定时触发方法（每100毫秒执行一次）
   * 遍历所有已注册的进度更新器并调用其 update 方法
   */
  private onTick(): void {
    this.progressUpdaters.forEach((updater) => updater.update());
  }
}
