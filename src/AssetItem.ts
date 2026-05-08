/**
 * 资产项组件
 * 负责单个资产（子资产）的 UI 展示、生产进度控制和购买逻辑
 * 实现 IProgressUpdater 接口，由 GameTimerManager 驱动定时更新
 * 
 * 核心功能：
 * - 生产进度条的定时更新和物品产出
 * - 购买按钮的状态管理和点击处理
 * - 多种购买模式支持（x1、10%、50%、下一级）
 * - 卡牌加成效果的应用（Power、Speed、Chance、Bonus）
 */

const { regClass, property } = Laya;
import Data from "./model/index";
import EventManager from "./utils/EventManager";
import Assets from "./utils/Assets";
import * as BN from "./utils/BigNumber";
import { GameTimerManager, IProgressUpdater } from "./utils/GameTimerManager";

@regClass()
export class AssetItem extends Laya.Script implements IProgressUpdater {
  /** 资产数量显示标签 */
  @property({ type: Laya.Label })
  public amount_label: Laya.Label;
  /** 每秒产出显示标签 */
  @property({ type: Laya.Label })
  public produce_label: Laya.Label;
  /** 生产进度条 */
  @property({ type: Laya.ProgressBar })
  public progress_bar: Laya.ProgressBar;
  /** 购买按钮 */
  @property({ type: Laya.Button })
  public buy_btn: Laya.Button;
  /** 提示按钮 */
  @property({ type: Laya.Button })
  public tip_btn: Laya.Button;

  /** 组件数据对象，包含配置、索引和兄弟组件引用 */
  public data: any = null;
  /** 子资产配置引用 */
  private config: any = null;
  /** 父资产面板索引 */
  private panel_idx: number;
  /** 子资产在面板中的索引 */
  private asset_idx: number;
  /** 每帧进度条增量（基于生产时间和速度加成） */
  private progress_step: number;
  /** 当前购买模式：x1 | 10% | 50% | 下一级 */
  private purchase_type: string = "x1";
  /** 当前可购买数量 */
  private can_buy_sum: string = "0";

  /**
   * 更新生产进度和购买按钮状态
   * 由 GameTimerManager 每100毫秒调用一次
   * 
   * 逻辑流程：
   * 1. 更新进度条值，满时触发物品产出
   * 2. 计算当前可购买数量
   * 3. 根据购买模式调整实际购买数量
   * 4. 更新购买按钮标签和可用状态
   */
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

  /**
   * 产出物品
   * 根据当前资产数量和配置计算产出量，应用各类加成效果
   * 
   * 产出计算：
   * - 正常进度模式：amount × outcome
   * - 高速模式（progress_step >= 0.1）：按时间比例计算产出
   * - 应用 Power 加成
   * - 根据 Chance 概率触发 Bonus 暴击
   * 
   * 产出目标：
   * - produce === "Parent"：产出到父资产
   * - 其他：产出到兄弟子资产
   */
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

  /**
   * 更新子资产标签显示
   * 由外部事件触发，重新初始化数据展示
   */
  public updateChildLabel() {
    this.initData();
  }

  /**
   * 处理购买按钮点击
   * 
   * 购买流程：
   * 1. 遍历 cost 配置，扣除对应消耗资源
   *    - Parent：扣除父资产数量
   *    - Employee：扣除员工数量
   *    - 其他：扣除兄弟子资产数量
   * 2. 增加当前子资产的数量
   * 3. 更新 UI 显示
   */
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

  /** 处理提示按钮点击（当前为空实现） */
  handleTipBtn() {}

  /**
   * 更新购买模式
   * @param type - 新的购买模式
   */
  updatePurchaseTimes(type?: any) {
    this.purchase_type = type;
  }

  /**
   * 初始化事件监听
   * 绑定购买按钮、提示按钮点击事件，以及购买模式变更事件
   */
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

  /**
   * IProgressUpdater 接口实现
   * 由 GameTimerManager 定时调用
   */
  update(): void {
    this.changeProgress();
  }

  /**
   * 初始化数据展示
   * 更新数量标签、产出标签和进度条步进值
   */
  initData() {
    this.amount_label.text = Assets.convertToUnits(this.config.amount);
    this.produce_label.text = Assets.convertToUnits(
      BN.mul(BN.mul(this.config.outcome, this.config.amount), this.config.bonus['Power'].quantity)
    );
    this.progress_step = 1 / this.config.time / 10 * this.config.bonus['Speed'].quantity;
    console.log(this.config.name, this.progress_step);
    EventManager.getInstance().Emit(this.data.config.name + '_update', [])
  }

  /**
   * 组件启动时调用
   * 初始化配置引用、索引、数据和事件，注册到 GameTimerManager
   */
  onStart() {
    this.buy_btn.label = "购买 x1";
    this.config = this.data.config;
    this.panel_idx = this.data.panel_idx;
    this.asset_idx = this.data.asset_idx;
    this.initData();
    this.initEvent();
    GameTimerManager.getInstance().registerProgressUpdater(this);
  }

  /**
   * 组件销毁时调用
   * 从 GameTimerManager 中注销，避免内存泄漏
   */
  onDestroy(): void {
    GameTimerManager.getInstance().unregisterProgressUpdater(this);
  }
}
