const { regClass, property } = Laya;

@regClass()
export class FooterTab extends Laya.Script {
  @property({ type: Laya.ViewStack })
  public scene_stack: Laya.ViewStack;

  private btn_list: any[] = [];
  onStart(): void {
    for (let i = 0; i < 5; i++) {
      this.btn_list.push(this.owner.getChildAt(i));
      this.owner
        .getChildAt(i)
        .on(Laya.Event.CLICK, this, this.handleBtnClick, [i]);
    }
    this.btn_list[this.scene_stack.selectedIndex].height = 70;
  }
  handleBtnClick(index: number) {
    this.scene_stack.selectedIndex = index;
    for (let i = 0; i < this.btn_list.length; i++) {
      if (index == i) {
        this.btn_list[i].height = 70;
      } else {
        this.btn_list[i].height = 60;
      }
    }
  }
}
