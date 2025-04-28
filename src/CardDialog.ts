import EventManager from "./utils/EventManager";
import Data from "./model/index";
import userInfo from "./model/userInfo";

const { regClass, property } = Laya;

@regClass()
export class CardDialog extends Laya.Script {
  @property({ type: Laya.ProgressBar })
  public collect_progress: Laya.ProgressBar;
  @property({ type: Laya.Image })
  public close_img: Laya.Image;
  @property({ type: Laya.Button })
  public upgrade_btn: Laya.Button;
  @property({ type: Laya.Label })
  public card_name_label: Laya.Label;
  @property({ type: Laya.Label })
  public card_des_label: Laya.Label;
  @property({ type: Laya.Label })
  public card_collect_progress_label: Laya.Label;
  @property({ type: Laya.Label })
  public collect_tip_label: Laya.Label;

  private card_info: any;
  private user_info: any;
  public initData(data: any) {
    this.card_info = data.card_info;
    this.user_info = data.user_info;
    console.log(this.user_info);
    console.log(this.card_info);
    this.card_name_label.text = this.card_info.name;
    this.card_des_label.text = "card description";

    const cur_card = this.user_info;
    const cur_card_amount = cur_card.has_amount;
    const cur_level = cur_card.level;
    const cur_level_card_target = Data.Cards_Level_Target[cur_level];
    const cur_level_point = Data.Cards_Upgrade_Point[cur_level];
    if (cur_card_amount > cur_level_card_target) {
      this.collect_progress.visible = false;
      this.upgrade_btn.visible = true;
      this.upgrade_btn.label = cur_level_point.toString();
    } else {
      this.collect_tip_label.text =
        "再收集" +
        (cur_level_card_target - cur_card_amount) +
        "张" +
        (cur_level == 0 ? "解锁" : "升级");
      this.card_collect_progress_label.text =
        cur_card_amount + "/" + cur_level_card_target;
      this.collect_progress.visible = true;
      this.upgrade_btn.visible = false;
    }
  }
  onStart(): void {
    this.close_img.on(Laya.Event.CLICK, this, () => {
      EventManager.getInstance().Emit("close_card_dialog", []);
    });
    this.upgrade_btn.on(Laya.Event.CLICK, this, this.upgradeCard);
  }
  // 升级卡牌
  upgradeCard() {
    const cur_card = this.user_info;
    const cur_card_amount = cur_card.has_amount;
    const cur_level = cur_card.level;
    const cur_level_card_target = Data.Cards_Level_Target[cur_level];
    const cur_point_target = Data.Cards_Upgrade_Point[cur_level];
    // 判断是否有足够科学点
    if (userInfo.science_point >= cur_point_target) {
      userInfo.science_point -= cur_point_target;
      EventManager.getInstance().Emit("Science_SPEND_update", [cur_point_target]);
      const rest_card = cur_card_amount - cur_level_card_target;
      cur_card.has_amount = rest_card;
      cur_card.level++;
      EventManager.getInstance().Emit("close_card_dialog", []);
      EventManager.getInstance().Emit("CardList_update", []);
    } else {
      // TODO：提示或者弹窗
      console.log("科学点不足");
    }
  }
}
