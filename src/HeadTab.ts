const { regClass, property } = Laya;
import Data from "./model/index";
import EventManager from "./utils/EventManager";
import Assets from "./utils/Assets";

@regClass()
export class Tab extends Laya.Script {

  @property({ type: Laya.ViewStack })
  public viewStack: Laya.ViewStack;
  @property({ type: Laya.Button })
  public times_btn: Laya.Button;
  @property({ type: Laya.Prefab })
  public tab_item_prefab: Laya.Prefab;

  private btn_list: any[] = [];
  private times_list: string[] = ["x1", "10%", "50%", "最大", "下一级"];
  private times_idx: number = 0;

  private readonly SELECTED_BTN_WIDTH: number = 160;
  private readonly TOTAL_TAB_WIDTH: number = 399;
  private readonly TIMES_OPTION_COUNT: number = 5;

  private calculateUnselectedBtnWidth(buttonCount: number): number {
    return (this.TOTAL_TAB_WIDTH - this.SELECTED_BTN_WIDTH) / (buttonCount - 1);
  }

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
  handleBtnClick(index: number) {
    this.viewStack.selectedIndex = index;
    const unselectedWidth = this.calculateUnselectedBtnWidth(this.btn_list.length);
    for (let i = 0; i < this.btn_list.length; i++) {
      this.setButtonLayout(this.btn_list[i], i, index, unselectedWidth);
    }
  }
}
