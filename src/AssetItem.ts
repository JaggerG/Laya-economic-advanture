const { regClass, property } = Laya;
import Data from "./model/index";
import EventManager from "./utils/EventManager";
import Assets from "./utils/Assets";
import * as BN from "./utils/BigNumber";
import { GameTimerManager, IProgressUpdater } from "./utils/GameTimerManager";

@regClass()
export class AssetItem extends Laya.Script implements IProgressUpdater {
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
  private can_buy_sum: string = "0";

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
    if (BN.gt(this.can_buy_sum, "0")) {
      if (this.purchase_type === "x1") {
        this.can_buy_sum = "1";
      } else if (this.purchase_type === "10%") {
        this.can_buy_sum =
          BN.mul(this.can_buy_sum, "0.1") === "0"
            ? "1"
            : BN.floorDiv(this.can_buy_sum, "10");
      } else if (this.purchase_type === "50%") {
        this.can_buy_sum =
          BN.mul(this.can_buy_sum, "0.5") === "0"
            ? "1"
            : BN.floorDiv(this.can_buy_sum, "2");
      } else if (this.purchase_type === "下一级") {
        this.can_buy_sum = Assets.calculateNextLevelCost(this.panel_idx, this.asset_idx);
      }
      this.buy_btn.label = "购买 x" + Assets.convertToUnits(this.can_buy_sum);
      this.buy_btn.gray = false;
      this.buy_btn.mouseEnabled = true;
    } else {
      this.buy_btn.label = "资源不足";
      this.buy_btn.gray = true;
      this.buy_btn.mouseEnabled = false;
    }
  }
  // 产出物品
  produce_goods() {
    let produce_num: string;
    if (this.progress_step < 0.1) {
      produce_num = BN.mul(this.config.amount, this.config.outcome);
    } else {
      const time = this.config.time * 10;
      produce_num = BN.div(BN.mul(BN.mul(this.config.amount, this.config.outcome), this.config.bonus['Speed'].quantity), time);
    }
    // 卡牌加成计算
    produce_num = BN.mul(produce_num, this.config.bonus['Power'].quantity);
    const probability = parseFloat(this.config.bonus['Chance'].quantity);
    const randomSeed = Math.random() * 100;
    if (randomSeed <= probability) {
      produce_num = BN.mul(produce_num, this.config.bonus['Bonus'].quantity);
      console.log('critical-----------------------')
    }
    EventManager.getInstance().Emit(this.config.name + '_COLLECT_update',[produce_num])
    // 更新数据和视图
    if (this.config.produce === "Parent") {
      const parent = Data.Assets[this.panel_idx];
      parent.amount = BN.add(parent.amount, produce_num);
      EventManager.getInstance().Emit("updateParentLabel", [this.panel_idx]);
      EventManager.getInstance().Emit(parent.name + '_COLLECT_update', [produce_num]);
    } else {
      const broConfig = Data.Assets[this.panel_idx].child[this.asset_idx - 1];
      broConfig.amount = BN.add(broConfig.amount, produce_num);
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
        Data.Assets[this.panel_idx].amount = BN.sub(Data.Assets[this.panel_idx].amount, this.can_buy_sum);
        EventManager.getInstance().Emit("updateParentLabel", [this.panel_idx]);
      } else if (this.config.cost[i].name === "Employee") {
        Data.Employee.amount = BN.sub(Data.Employee.amount, this.can_buy_sum);
        EventManager.getInstance().Emit("updateEmployeeLabel", []);
      } else {
        let bro = Data.Assets[this.panel_idx].child[this.asset_idx - 1];
        bro.amount = BN.sub(bro.amount, this.can_buy_sum);
        EventManager.getInstance().Emit("updateChildLabel" + bro.name, []);
      }
    }

    // 增加总数
    this.config.amount = BN.add(this.config.amount, this.can_buy_sum);
    // 更新UI
    this.amount_label.text = Assets.convertToUnits(this.config.amount);
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
  update(): void {
    this.changeProgress();
  }

  initData() {
    this.amount_label.text = Assets.convertToUnits(this.config.amount);
    this.produce_label.text = Assets.convertToUnits(
      BN.mul(BN.mul(this.config.outcome, this.config.amount), this.config.bonus['Power'].quantity)
    );
    this.progress_step = 1 / this.config.time / 10 * this.config.bonus['Speed'].quantity;
    console.log(this.config.name, this.progress_step);
    EventManager.getInstance().Emit(this.data.config.name + '_update', [])
  }
  onStart() {
    this.buy_btn.label = "购买 x1";
    this.config = this.data.config;
    this.panel_idx = this.data.panel_idx;
    this.asset_idx = this.data.asset_idx;
    this.initData();
    this.initEvent();
    GameTimerManager.getInstance().registerProgressUpdater(this);
  }

  onDestroy(): void {
    GameTimerManager.getInstance().unregisterProgressUpdater(this);
  }
}
