const { regClass, property } = Laya;
import Data from "./model/index";
import EventManager from "./utils/EventManager";
import Assets from "./utils/Assets";
import * as BN from "./utils/BigNumber";
import { GameTimerManager, IProgressUpdater } from "./utils/GameTimerManager";

@regClass()
export class Employee extends Laya.Script implements IProgressUpdater {
  @property({ type: Laya.ProgressBar })
  public employee_progress: Laya.ProgressBar;
  @property({ type: Laya.Label })
  public employee_amount_label: Laya.Label;

  private step: number = 0;

  update(): void {
    this.changeProgress();
  }

  onStart(): void {
    this.employee_amount_label.text = Assets.convertToUnits(Data.Employee.amount);
    this.step = 1 / 10;
    GameTimerManager.getInstance().registerProgressUpdater(this);
    EventManager.getInstance().Add("updateEmployeeLabel", this, () => {
      this.employee_amount_label.text = Assets.convertToUnits(Data.Employee.amount);
    });
  }

  onDestroy(): void {
    GameTimerManager.getInstance().unregisterProgressUpdater(this);
  }
  changeProgress(): void {
    if (this.employee_progress.value >= 1) {
      Data.Employee.amount = BN.add(Data.Employee.amount, Data.Employee.produce_per_sec);
      this.employee_amount_label.text = Assets.convertToUnits(Data.Employee.amount);
      this.employee_progress.value = 0;
    }
    this.employee_progress.value += this.step;
  }
}
