/**
 * 顶部标签栏组件
 * 负责资产面板的顶部导航按钮展示和切换
 * 实现动态按钮宽度计算：选中按钮宽度固定为160，其余按钮均分剩余空间
 * 
 * 核心功能：
 * - 动态生成资产标签按钮
 * - 标签切换时的按钮布局动画
 * - 购买模式切换（x1、10%、50%、最大、下一级）
 */

const { regClass, property } = Laya;
import Data from "./model/index";
import EventManager from "./utils/EventManager";
import Assets from "./utils/Assets";

@regClass()
export class Tab extends Laya.Script {

  /** 视图堆栈，用于切换不同资产面板 */
  @property({ type: Laya.ViewStack })
  public viewStack: Laya.ViewStack;
  /** 购买模式切换按钮 */
  @property({ type: Laya.Button })
  public times_btn: Laya.Button;
  /** 标签项预制体 */
  @property({ type: Laya.Prefab })
  public tab_item_prefab: Laya.Prefab;

  /** 标签按钮列表 */
  private btn_list: any[] = [];
  /** 购买模式选项数组 */
  private times_list: string[] = ["x1", "10%", "50%", "最大", "下一级"];
  /** 当前购买模式索引 */
  private times_idx: number = 0;

  /** 选中按钮的固定宽度 */
  private readonly SELECTED_BTN_WIDTH: number = 160;
  /** 标签栏总宽度 */
  private readonly TOTAL_TAB_WIDTH: number = 399;
  /** 购买模式选项总数 */
  private readonly TIMES_OPTION_COUNT: number = 5;

  /**
   * 计算未选中按钮的宽度
   * @param buttonCount - 按钮总数
   * @returns 未选中按钮的均分宽度
   */
  private calculateUnselectedBtnWidth(buttonCount: number): number {
    return (this.TOTAL_TAB_WIDTH - this.SELECTED_BTN_WIDTH) / (buttonCount - 1);
  }

  /**
   * 设置按钮布局
   * @param button - 目标按钮
   * @param index - 按钮索引
   * @param selectedIndex - 当前选中按钮的索引
   * @param unselectedWidth - 未选中按钮的宽度
   * 
   * 布局规则：
   * - 选中按钮：宽度为 SELECTED_BTN_WIDTH，x 坐标根据索引计算
   * - 未选中按钮（在选中按钮右侧）：x 坐标向右偏移选中按钮的宽度
   * - 未选中按钮（在选中按钮左侧）：x 坐标按索引均分
   */
  private setButtonLayout(
    button: Laya.Button,
    index: number,
    selectedIndex: number,
    unselectedWidth: number
  ): void {
    if (index === selectedIndex) {
      button.width = this.SELECTED_BTN_WIDTH;
      button.x = index > 0 ? index * unselectedWidth : 0;
    } else if (selectedIndex < index) {
      button.x = unselectedWidth * (index - 1) + this.SELECTED_BTN_WIDTH;
      button.width = unselectedWidth;
    } else {
      button.x = index * unselectedWidth;
      button.width = unselectedWidth;
    }
  }

  /**
   * 组件启动时调用
   * 根据资产配置动态生成标签按钮，初始化事件监听
   */
  onStart(): void {
    const buttonCount = Data.Assets.length;
    const unselectedWidth = this.calculateUnselectedBtnWidth(buttonCount);

    for (let i = 0; i < buttonCount; i++){
      let instance: Laya.Button = this.tab_item_prefab.create() as Laya.Button;
      instance.on(Laya.Event.CLICK, this, this.handleBtnClick, [i]);
      instance.label = Assets.convertToUnits(Data.Assets[i].amount);
      this.btn_list.push(instance);
      instance.y = 0;
      this.setButtonLayout(instance, i, 0, unselectedWidth);
      this.owner.addChild(instance);
    }
    this.initEvent();
    this.times_btn.label = this.times_list[0];
  }

  /**
   * 处理购买模式切换按钮点击
   * 循环切换购买模式：x1 -> 10% -> 50% -> 最大 -> 下一级 -> x1
   * 切换后派发 updatePurchaseTimes 事件通知所有 AssetItem 组件
   */
  handleTimesBtn() {
    if (this.times_idx + 1 < this.TIMES_OPTION_COUNT) {
      this.times_idx++;
    } else {
      this.times_idx = 0;
    }
    this.times_btn.label = this.times_list[this.times_idx];
    EventManager.getInstance().Emit("updatePurchaseTimes", [
      this.times_list[this.times_idx],
    ]);
  }

  /**
   * 初始化事件监听
   * 监听 updateParentLabel 事件更新标签按钮上的资产数量显示
   * 绑定购买模式切换按钮点击事件
   */
  initEvent() {
    EventManager.getInstance().Add(
      "updateParentLabel",
      this,
      (panel_idx: number) => {
        // 更新视图
        this.btn_list[panel_idx].label =
          Assets.convertToUnits(Data.Assets[panel_idx].amount);
        EventManager.getInstance().Emit(Data.Assets[panel_idx].name + '_update', []);
      }
    );
    this.times_btn.on(Laya.Event.CLICK, this, this.handleTimesBtn);
  }

  /**
   * 处理标签按钮点击
   * @param index - 点击的按钮索引
   * 
   * 切换逻辑：
   * 1. 切换 viewStack 的选中索引
   * 2. 重新计算所有按钮的布局位置
   */
  handleBtnClick(index: number) {
    this.viewStack.selectedIndex = index;
    const unselectedWidth = this.calculateUnselectedBtnWidth(this.btn_list.length);
    for (let i = 0; i < this.btn_list.length; i++) {
      this.setButtonLayout(this.btn_list[i], i, index, unselectedWidth);
    }
  }
}
