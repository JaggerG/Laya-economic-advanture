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
  private times_list: string[] = ["x1", "10%", "50%", "最大"];
  private times_idx: number = 0;
  onStart(): void {
    for (let i = 0; i < Data.Assets.length; i++){
      let instance: Laya.Button = this.tab_item_prefab.create() as Laya.Button;
      instance.on(Laya.Event.CLICK, this, this.handleBtnClick, [i]);
      instance.label = Data.Assets[i].amount.toString()
      this.btn_list.push(instance);
      // EventManager.getInstance().Add(Data.Assets[i].name + '_update', this, this.updateParentLabel, [i])
      instance.y = 0;
      if (i === 0) {
        instance.width = 160
        instance.x = 0;
      } else {
        instance.width = (399 - 160) / (Data.Assets.length - 1)
        instance.x = 160 + (i - 1) * instance.width;
      }
      this.owner.addChild(instance);
      
    }
    this.initEvent();
    this.times_btn.label = this.times_list[0];
  }
  handleTimesBtn() {
    if (this.times_idx + 1 < 4) {
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
          Assets.convertToUnits(Data.Assets[panel_idx].amount.toString());
        EventManager.getInstance().Emit(Data.Assets[panel_idx].name + '_update', []);
        // EventManager.getInstance().Emit(Data.Assets[panel_idx].name + '_COLLECT_update', []);
      }
    );
    this.times_btn.on(Laya.Event.CLICK, this, this.handleTimesBtn);
  }
  handleBtnClick(index: number) {
    this.viewStack.selectedIndex = index;
    const unselected_width = (399 -160) / (Data.Assets.length - 1);
    for (let i = 0; i < this.btn_list.length; i++) {
      if (index === i) {
        this.btn_list[i].x = index > 0 ? index * unselected_width : 0;
        this.btn_list[i].width = 160;
      } else if (index < i) {
        this.btn_list[i].x = unselected_width * (i-1) + 160;
        this.btn_list[i].width = unselected_width
      } else {
        this.btn_list[i].x = i * unselected_width;
        this.btn_list[i].width = unselected_width
      }
    }
  }
}
