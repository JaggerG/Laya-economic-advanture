/**
 * 底部标签栏组件
 * 负责底部导航按钮的展示和场景切换
 * 点击不同按钮切换 ViewStack 的选中索引，并调整按钮高度以显示选中状态
 */

const { regClass, property } = Laya;

@regClass()
export class FooterTab extends Laya.Script {
  /** 场景视图堆栈，用于切换不同页面 */
  @property({ type: Laya.ViewStack })
  public scene_stack: Laya.ViewStack;

  /** 底部按钮列表 */
  private btn_list: any[] = [];

  /**
   * 组件启动时调用
   * 初始化底部按钮列表，绑定点击事件，设置默认选中状态
   */
  onStart(): void {
    for (let i = 0; i < 5; i++) {
      this.btn_list.push(this.owner.getChildAt(i));
      this.owner
        .getChildAt(i)
        .on(Laya.Event.CLICK, this, this.handleBtnClick, [i]);
    }
    this.btn_list[this.scene_stack.selectedIndex].height = 70;
  }

  /**
   * 处理底部按钮点击
   * @param index - 点击的按钮索引
   * 
   * 切换逻辑：
   * 1. 切换 scene_stack 的选中索引
   * 2. 选中按钮高度设为 70，其他按钮高度设为 60
   */
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
