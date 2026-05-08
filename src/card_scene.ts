/**
 * 卡牌场景组件
 * 负责卡牌列表页面的整体布局和交互
 * 以网格形式展示所有卡牌，支持点击弹出详情弹窗
 * 
 * 核心功能：
 * - 动态生成卡牌列表项
 * - 管理卡牌详情弹窗的显示/隐藏
 * - 响应卡牌数据更新事件
 */

const { regClass, property, Browser } = Laya;
import { CardItem } from "./CardItem";
import EventManager from "./utils/EventManager";
import Data from "./model/index";
import { CardDialog } from "./CardDialog";

@regClass()
export class card_scene extends Laya.Script {
  /** 卡牌项预制体 */
  @property({ type: Laya.Prefab })
  public card_item_prefab: Laya.Prefab;
  /** 卡牌详情弹窗 */
  @property({ type: Laya.Dialog })
  public card_dialog: Laya.Dialog;

  /** 卡牌组件列表，用于批量更新 */
  private card_item_list: any = [];

  /**
   * 组件启动时调用
   * 根据屏幕宽度计算网格布局，动态生成所有卡牌项
   * 
   * 布局规则：
   * - 每行显示3张卡牌
   * - 根据屏幕宽度计算间距和对齐
   * - 卡牌纵向排列，每满3张换行
   */
  onStart(): void {
    const x_offset = Browser.clientWidth / 3;
    const space = (x_offset - 90) / 2;
    let col_flag = 0;
    for (let i = 0; i < Data.Cards.length; i++) {
      let instance: Laya.Sprite = this.card_item_prefab.create() as Laya.Sprite;
      let card_comp = instance.getComponent(CardItem);
      this.card_item_list.push(card_comp);
      card_comp.initCard(Data.Cards[i]);
      instance.x = (i % 3) * x_offset + space;
      instance.y = col_flag * 140;
      if (i % 3 === 2 && i !== 0) {
        col_flag++;
      }
      this.owner.addChild(instance);
    }
    this.initEvent();
  }

  /**
   * 初始化事件监听
   * 监听 showCardDialog、close_card_dialog、CardList_update 事件
   */
  initEvent() {
    EventManager.getInstance().Add("showCardDialog", this, this.showCardDialog);
    EventManager.getInstance().Add(
      "close_card_dialog",
      this,
      this.closeCardDialog
    );
    EventManager.getInstance().Add(
      "CardList_update",
      this,
      this.updateCardList
    );
  }

  /**
   * 更新所有卡牌列表项的显示
   * 当卡牌数据发生变化时（如抽卡、升级后）调用
   */
  updateCardList() {
    this.card_item_list.forEach((item: any) => {
      item.updateCardInfo();
    });
  }

  /**
   * 显示卡牌详情弹窗
   * @param data - 包含卡牌信息和玩家信息的数据对象
   * 
   * 仅在卡牌已解锁（isShowDialog 为 true）时显示弹窗
   */
  showCardDialog(data: any) {
    if (data.isShowDialog) {
      this.card_dialog.getComponent(CardDialog).initData(data);
      this.card_dialog.visible = true;
      this.card_dialog.show();
    }
  }

  /**
   * 关闭卡牌详情弹窗
   */
  closeCardDialog() {
    this.card_dialog.visible = false;
  }
}
