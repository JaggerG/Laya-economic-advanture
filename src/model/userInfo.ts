/**
 * 用户运行时数据模块
 * 存储玩家在游戏过程中的动态数据，包括等级、科学点数、任务进度、卡牌收集等信息
 * 该数据会在游戏过程中被频繁修改，并支持存档/读档功能
 */

export default {
    /** 玩家当前等级 */
    level: 0,
    /** 玩家当前经验值 */
    exp: 0,
    /** 玩家当前拥有的科学点数，用于卡牌升级等操作 */
    science_point: 10,
    /** 任务系统相关数据 */
    Task: {
        /** 当前任务等级 */
        task_level: 0,
        /** 当前任务总体进度 */
        task_progress: 0,
        /** 当前显示的最大任务索引 */
        task_idx_max: 2,
        /** 每个任务面板的配置信息，包含任务索引和当前步数 */
        task_idx_config: [
            { idx: 0, step: 0 },
            { idx: 1, step: 0 },
            { idx: 2, step: 0 },
        ],
        /** 已完成任务的总步数 */
        task_step: 0,
    },
    /** 玩家已收集的卡牌数组，包含卡牌的等级、数量等动态信息 */
    Card: [
        { name: "card1", imgUrl: "", type: "Speed", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 3 ,origin_ratio: 2, cost: 50, weight: 20, has_amount: 5},
        { name: "card5", imgUrl: "", type: "Discount", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 2, origin_ratio: 2, cost: 50, has_amount: 3, weight: 20 },
        { name: "card3", imgUrl: "", type: "Chance", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 3, origin_ratio: 2, cost: 50, has_amount: 3, weight: 20 },
        { name: "card2", imgUrl: "", type: "Bonus", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 4, origin_ratio: 2, cost: 50, has_amount: 3, weight: 20 },
        { name: "card4", imgUrl: "", type: "Power", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 5, origin_ratio: 2, cost: 50, has_amount: 3, weight: 20 },
    ]
}
