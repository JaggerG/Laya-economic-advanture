const { regClass, property, Browser } = Laya;
import { CardItem } from "./CardItem";
import EventManager from "./utils/EventManager";
import Data from "./model/index";
import { CardDialog } from "./CardDialog";

@regClass()
export class card_scene extends Laya.Script {
  @property({ type: Laya.Prefab })
  public card_item_prefab: Laya.Prefab;
  @property({ type: Laya.Dialog })
  public card_dialog: Laya.Dialog;

  private card_item_list: any = [];
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
  updateCardList() {
    this.card_item_list.forEach((item: any) => {
      item.updateCardInfo();
    });
  }
  showCardDialog(data: any) {
    if (data.isShowDialog) {
      this.card_dialog.getComponent(CardDialog).initData(data);
      this.card_dialog.visible = true;
      this.card_dialog.show();
    }
  }
  closeCardDialog() {
    this.card_dialog.visible = false;
  }
}
