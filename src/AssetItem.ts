const { regClass, property } = Laya;
import Data from "./model/index";
import EventManager from "./utils/EventManager";
import Assets from "./utils/Assets";
import Decimal from "decimal.js";

@regClass()
export class AssetItem extends Laya.Script {
  @property({ type: Laya.Label })
  public amount_label: Laya.Label;
  @property({ type: Laya.Label })
  public produce_label: Laya.Label;
  @property({ type: Laya.ProgressBar })
  public progress_bar: Laya.ProgressBar;
  @property({ type: Laya.Button })
  public buy_btn: Laya.Button;
  @property({ type: Laya.Button })
  public tip_btn: Laya.Button;

  public data: any = null;
  private config: any = null;
  private panel_idx: number;
  private asset_idx: number;
  private progress_step: number;
  private purchase_type: string = "x1";
  private can_buy_sum: any = 0;

  changeProgress() {
    if (this.progress_step < 0.1) {
        if (this.progress_bar.value >= 1) {
          this.progress_bar.value = 0;
          this.produce_goods();
      }
      this.progress_bar.value += this.progress_step;
    } else {
      this.produce_goods();
    }
    this.can_buy_sum = Assets.can_buy_sum(this.panel_idx, this.asset_idx);
    if (this.can_buy_sum > 0) {
      if (this.purchase_type === "x1") {
        this.can_buy_sum = "1";
      } else if (this.purchase_type === "10%") {
        this.can_buy_sum =
          // Math.floor(this.can_buy_sum * 0.1) === 0
          new Decimal(this.can_buy_sum).mul(0.1).toString() === "0"
            ? "1"
            : new Decimal(this.can_buy_sum).mul(0.1).toDP(0).toFixed(0);
      } else if (this.purchase_type === "50%") {
        this.can_buy_sum =
          // Math.floor(this.can_buy_sum * 0.5) === 0
          new Decimal(this.can_buy_sum).mul(0.5).toString() === "0"
            ? "1"
            : new Decimal(this.can_buy_sum).mul(0.5).toDP(0).toFixed(0);
      }
      this.buy_btn.label = "购买 x" + Assets.convertToUnits(this.can_buy_sum);
    } else {
      // TODO: 不能购买UI更新
    }
  }
  // 产出物品
  produce_goods() {
    let produce_num;
    if (this.progress_step < 0.1) {
      produce_num = this.config.amount * this.config.outcome;
    } else {
      const time = this.config.time * 10;
      produce_num = this.config.amount * this.config.outcome / time * this.config.bonus['Speed'].quantity;
    }
    // 卡牌加成计算
    produce_num *= this.config.bonus['Power'].quantity
    const probability = this.config.bonus['Chance'].quantity
    const randomSeed = Math.random() * 100;
    if (randomSeed <= probability) {
      // TODO: 逻辑待优化
      // TODO: 动画展示
      produce_num *= this.config.bonus['Bonus'].quantity
      console.log('critical-----------------------')
    }
    EventManager.getInstance().Emit(this.config.name + '_COLLECT_update',[produce_num])
    // 更新数据和视图
    if (this.config.produce === "Parent") {
      const parent = Data.Assets[this.panel_idx];
      parent.amount += produce_num;
      EventManager.getInstance().Emit("updateParentLabel", [this.panel_idx]);
      EventManager.getInstance().Emit(parent.name + '_COLLECT_update', [produce_num]);
    } else {
      const broConfig = Data.Assets[this.panel_idx].child[this.asset_idx - 1];
      broConfig.amount += produce_num;
      this.data.bro.updateChildLabel();
    }
  }
  // 更新数据
  public updateChildLabel() {
    this.initData();
  }
  handleBuyBtn() {
    // 减去消耗品
    for (let i = 0; i < this.config.cost.length; i++) {
      if (this.config.cost[i].name === "Parent") {
        Data.Assets[this.panel_idx].amount -= parseInt(this.can_buy_sum);
        EventManager.getInstance().Emit("updateParentLabel", [this.panel_idx]);
      } else if (this.config.cost[i].name === "Employee") {
        Data.Employee.amount -= parseInt(this.can_buy_sum);
        EventManager.getInstance().Emit("updateEmployeeLabel", []);
      } else {
        let bro = Data.Assets[this.panel_idx].child[this.asset_idx - 1];
        bro.amount -= parseInt(this.can_buy_sum);
        EventManager.getInstance().Emit("updateChildLabel" + bro.name, []);
      }
    }

    // 增加总数
    this.config.amount += parseInt(this.can_buy_sum);
    // 更新UI
    this.amount_label.text = this.config.amount.toString();
    this.initData();
  }
  handleTipBtn() {}
  updatePurchaseTimes(type?: any) {
    this.purchase_type = type;
  }
  initEvent() {
    this.buy_btn.on(Laya.Event.CLICK, this, this.handleBuyBtn);
    this.tip_btn.on(Laya.Event.CLICK, this, this.handleTipBtn);
    EventManager.getInstance().Add(
      "updatePurchaseTimes",
      this,
      this.updatePurchaseTimes
    );
    EventManager.getInstance().Add(
      "updateChildLabel" + this.config.name,
      this,
      this.updateChildLabel
    );
  }
  initData() {
    this.amount_label.text = this.config.amount.toString();
    this.produce_label.text = (
      this.config.outcome * this.config.amount * this.config.bonus['Power'].quantity
    ).toString();
    this.progress_step = 1 / this.config.time / 10 * this.config.bonus['Speed'].quantity;
    console.log(this.config.name, this.progress_step);
    // 启动进度条
    Laya.timer.loop(100, this, this.changeProgress);
    EventManager.getInstance().Emit(this.data.config.name + '_update', [])
  }
  onStart() {
    this.buy_btn.label = "购买 x1";
    this.config = this.data.config;
    this.panel_idx = this.data.panel_idx;
    this.asset_idx = this.data.asset_idx;
    this.initData();
    this.initEvent();

  }
}
