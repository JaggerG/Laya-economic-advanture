const { regClass, property } = Laya;
import Data from "./model/index";
import EventManager from "./utils/EventManager";

@regClass()
export class Employee extends Laya.Script {
  @property({ type: Laya.ProgressBar })
  public employee_progress: Laya.ProgressBar;
  @property({ type: Laya.Label })
  public employee_amount_label: Laya.Label;

  private step: number = 0;

  onStart(): void {
    this.employee_amount_label.text = Data.Employee.amount.toString();
    this.step = 1 / 10;
    Laya.timer.loop(100, this, this.changeProgress);
    EventManager.getInstance().Add("updateEmployeeLabel", this, () => {
      this.employee_amount_label.text = Data.Employee.amount.toString();
    });
  }
  changeProgress(): void {
    // const progressPercent = this.cur_time / this.config.time
    if (this.employee_progress.value >= 1) {
      Data.Employee.amount += Data.Employee.produce_per_sec;
      this.employee_amount_label.text = Data.Employee.amount.toString();
      this.employee_progress.value = 0;
    }
    this.employee_progress.value += this.step;
  }
}
