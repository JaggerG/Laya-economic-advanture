export default {
    level: 0,
    science_point: 10,
    Task: {
        task_level: 0,
        task_progress: 0,
        task_idx_max: 2,
        task_idx_config: [
            { idx: 0, step: 0 },
            { idx: 1, step: 0 },
            { idx: 2, step: 0 },
        ],
        task_step: 0,
    },
    Card: [
        { name: "card1", imgUrl: "", type: "Speed", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 3 ,origin_ratio: 2, cost: 50, weight: 20, has_amount: 5},
        { name: "card5", imgUrl: "", type: "Discount", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 2, origin_ratio: 2, cost: 50, has_amount: 3, weight: 20 },
        { name: "card3", imgUrl: "", type: "Chance", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 3, origin_ratio: 2, cost: 50, has_amount: 3, weight: 20 },
        { name: "card2", imgUrl: "", type: "Bonus", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 4, origin_ratio: 2, cost: 50, has_amount: 3, weight: 20 },
        { name: "card4", imgUrl: "", type: "Power", related_assets: "Farmer", level_ratio: 2, level_require: 0, level: 5, origin_ratio: 2, cost: 50, has_amount: 3, weight: 20 },
    ]
}