/**
 * 员工组件
 * 负责员工资源的自动生产进度控制和数量显示
 * 实现 IProgressUpdater 接口，由 GameTimerManager 驱动定时更新
 * 
 * 核心功能：
 * - 员工进度条的定时更新
 * - 进度满时自动增加员工数量
 * - 员工数量的格式化显示
 */

const { regClass, property } = Laya;
import Data from "./model/index";
import EventManager from "./utils/EventManager";
import Assets from "./utils/Assets";
import * as BN from "./utils/BigNumber";
import { GameTimerManager, IProgressUpdater } from "./utils/GameTimerManager";

@regClass()
export class Employee extends Laya.Script implements IProgressUpdater {
  /** 员工生产进度条 */
  @property({ type: Laya.ProgressBar })
  public employee_progress: Laya.ProgressBar;
  /** 员工数量显示标签 */
  @property({ type: Laya.Label })
  public employee_amount_label: Laya.Label;

  /** 每帧进度条增量（固定为 1/10，即每10 tick完成一次生产） */
  private step: number = 0;

  /**
   * IProgressUpdater 接口实现
   * 由 GameTimerManager 每100毫秒调用一次
   */
  update(): void {
    this.changeProgress();
  }

  /**
   * 组件启动时调用
   * 初始化员工数量显示、进度步进值，注册到 GameTimerManager
   * 监听 updateEmployeeLabel 事件以响应数量变化
   */
  onStart(): void {
    this.employee_amount_label.text = Assets.convertToUnits(Data.Employee.amount);
    this.step = 1 / 10;
    GameTimerManager.getInstance().registerProgressUpdater(this);
    EventManager.getInstance().Add("updateEmployeeLabel", this, () => {
      this.employee_amount_label.text = Assets.convertToUnits(Data.Employee.amount);
    });
  }

  /**
   * 组件销毁时调用
   * 从 GameTimerManager 中注销，避免内存泄漏
   */
  onDestroy(): void {
    GameTimerManager.getInstance().unregisterProgressUpdater(this);
  }

  /**
   * 更新员工生产进度
   * 
   * 生产逻辑：
   * - 进度条满时：增加员工数量（amount += produce_per_sec），重置进度条
   * - 每 tick 增加固定步进值
   */
  changeProgress(): void {
    if (this.employee_progress.value >= 1) {
      Data.Employee.amount = BN.add(Data.Employee.amount, Data.Employee.produce_per_sec);
      this.employee_amount_label.text = Assets.convertToUnits(Data.Employee.amount);
      this.employee_progress.value = 0;
    }
    this.employee_progress.value += this.step;
  }
}
