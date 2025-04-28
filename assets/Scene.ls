{
  "_$ver": 1,
  "_$id": "lx8mwule",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "main",
  "_$child": [
    {
      "_$id": "omhi6djj",
      "_$type": "Panel",
      "name": "Panel",
      "width": 399,
      "height": 844,
      "_mouseState": 2,
      "centerX": 0,
      "_$child": [
        {
          "_$id": "o37pomui",
          "_$type": "ViewStack",
          "name": "scene_stack",
          "y": 54.99999999999994,
          "width": 399,
          "height": 724,
          "_mouseState": 2,
          "centerX": 0,
          "selectedIndex": 0,
          "_$child": [
            {
              "_$id": "mm8nlvrx",
              "_$type": "Panel",
              "name": "item0",
              "width": 399,
              "height": 744,
              "_mouseState": 2,
              "scrollType": 2,
              "_$comp": [
                {
                  "_$type": "7bad1742-6eed-4d8d-81c0-501dc5bf03d6",
                  "scriptPath": "../src/main_scene.ts",
                  "viewStack": {
                    "_$ref": "gzw65ioi"
                  },
                  "asset_item_prefab": {
                    "_$uuid": "59d1709a-f119-4db5-bede-4da0447e8e5f",
                    "_$type": "Prefab"
                  },
                  "task_list_box": {
                    "_$ref": "j3r18h0f"
                  },
                  "task_item_prefab": {
                    "_$uuid": "202d4ee8-4e6f-4ad1-a507-2fc463516dab",
                    "_$type": "Prefab"
                  },
                  "s_point_label": {
                    "_$ref": "gul7olyi"
                  },
                  "task_progress": {
                    "_$ref": "horfrnce"
                  }
                }
              ],
              "_$child": [
                {
                  "_$id": "kgszb5t0",
                  "_$type": "Panel",
                  "name": "header_panel",
                  "y": -25,
                  "width": 394,
                  "height": 187,
                  "_mouseState": 2,
                  "_$child": [
                    {
                      "_$id": "fu6nug5h",
                      "_$type": "ProgressBar",
                      "name": "employee_progress",
                      "x": 82,
                      "y": 37,
                      "width": 111,
                      "height": 30,
                      "skin": "res://ae3de75e-ee9f-478d-9f8b-ede75a4fc296",
                      "value": 0.5,
                      "_$comp": [
                        {
                          "_$type": "f53d9d2c-9df5-44fc-b8c1-5557490dbbc8",
                          "scriptPath": "../src/Employee.ts",
                          "employee_progress": {
                            "_$ref": "fu6nug5h"
                          },
                          "employee_amount_label": {
                            "_$ref": "6ym1ai8b"
                          }
                        }
                      ],
                      "_$child": [
                        {
                          "_$id": "6ym1ai8b",
                          "_$type": "Label",
                          "name": "employee_amount_label",
                          "width": 98,
                          "height": 28,
                          "text": "Label",
                          "fontSize": 20,
                          "color": "#FFFFFF",
                          "align": "center",
                          "valign": "middle",
                          "padding": "0,0,0,0"
                        }
                      ]
                    },
                    {
                      "_$id": "2sj0bnki",
                      "_$type": "Image",
                      "name": "Image",
                      "y": 26,
                      "width": 76,
                      "height": 72,
                      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
                      "color": "#ffffff"
                    },
                    {
                      "_$id": "horfrnce",
                      "_$type": "ProgressBar",
                      "name": "task_progress",
                      "x": 82,
                      "y": 87,
                      "width": 239,
                      "height": 12,
                      "skin": "res://ae3de75e-ee9f-478d-9f8b-ede75a4fc296",
                      "value": 0.5
                    },
                    {
                      "_$id": "j3r18h0f",
                      "_$type": "Box",
                      "name": "task_list",
                      "y": 105,
                      "width": 399,
                      "height": 80
                    },
                    {
                      "_$id": "fgf426g2",
                      "_$type": "Image",
                      "name": "s_img",
                      "x": 204,
                      "y": 35,
                      "width": 30,
                      "height": 30,
                      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
                      "color": "#ffffff"
                    },
                    {
                      "_$id": "gul7olyi",
                      "_$type": "Label",
                      "name": "s_label",
                      "x": 239,
                      "y": 37,
                      "width": 120,
                      "height": 28,
                      "text": "Label",
                      "fontSize": 20,
                      "color": "#FFFFFF",
                      "valign": "middle",
                      "padding": "0,0,0,0"
                    }
                  ]
                },
                {
                  "_$id": "ym3e8p8k",
                  "_$type": "Image",
                  "name": "header_tab",
                  "y": 166.00000000000003,
                  "width": 401,
                  "height": 106,
                  "_mouseState": 2,
                  "skin": "res://3225dc27-5bcb-446e-8b66-27df87624835",
                  "color": "#ffffff",
                  "_$comp": [
                    {
                      "_$type": "78e574e1-3f9b-4c0a-8d66-e60557a60634",
                      "scriptPath": "../src/HeadTab.ts",
                      "viewStack": {
                        "_$ref": "gzw65ioi"
                      },
                      "times_btn": {
                        "_$ref": "r7rjg8il"
                      },
                      "tab_item_prefab": {
                        "_$uuid": "1153e345-fb53-408b-8146-79f8e5651c83",
                        "_$type": "Prefab"
                      }
                    }
                  ],
                  "_$child": [
                    {
                      "_$id": "r7rjg8il",
                      "_$type": "Button",
                      "name": "times_btn",
                      "x": 298,
                      "y": 66,
                      "width": 96,
                      "height": 36,
                      "_mouseState": 2,
                      "skin": "res://d4cfd6a8-0d0a-475b-ac93-d85eaa646936",
                      "label": "Title",
                      "labelSize": 20,
                      "labelAlign": "center",
                      "labelVAlign": "middle"
                    }
                  ]
                },
                {
                  "_$id": "gzw65ioi",
                  "_$type": "ViewStack",
                  "name": "ViewStack",
                  "y": 274,
                  "width": 399,
                  "height": 470,
                  "_mouseState": 2,
                  "selectedIndex": 0,
                  "_$child": [
                    {
                      "_$id": "ntrjtxah",
                      "_$type": "Panel",
                      "name": "item0",
                      "width": 399,
                      "height": 470,
                      "_mouseState": 2,
                      "scrollType": 2,
                      "_$child": [
                        {
                          "_$id": "527xjaba",
                          "_$type": "Panel",
                          "name": "asset_panels",
                          "width": 399,
                          "height": 469,
                          "_mouseState": 2
                        }
                      ]
                    },
                    {
                      "_$id": "6nq56bjk",
                      "_$type": "Panel",
                      "name": "item1",
                      "width": 399,
                      "height": 470,
                      "visible": false,
                      "_mouseState": 2,
                      "scrollType": 2,
                      "_$child": [
                        {
                          "_$id": "9o34ujvd",
                          "_$type": "Panel",
                          "name": "asset_panels",
                          "width": 399,
                          "height": 469,
                          "_mouseState": 2
                        }
                      ]
                    },
                    {
                      "_$id": "gb058d15",
                      "_$type": "Panel",
                      "name": "item2",
                      "width": 399,
                      "height": 470,
                      "visible": false,
                      "_mouseState": 2,
                      "scrollType": 2,
                      "_$child": [
                        {
                          "_$id": "0w4yvm27",
                          "_$type": "Panel",
                          "name": "asset_panels",
                          "width": 399,
                          "height": 469,
                          "_mouseState": 2
                        }
                      ]
                    },
                    {
                      "_$id": "a2twvbsg",
                      "_$type": "Panel",
                      "name": "item3",
                      "width": 399,
                      "height": 470,
                      "visible": false,
                      "_mouseState": 2,
                      "scrollType": 2,
                      "_$child": [
                        {
                          "_$id": "ej7veqds",
                          "_$type": "Panel",
                          "name": "asset_panels",
                          "width": 399,
                          "height": 469,
                          "_mouseState": 2
                        }
                      ]
                    },
                    {
                      "_$id": "wq8kvo28",
                      "_$type": "Panel",
                      "name": "item4",
                      "width": 399,
                      "height": 470,
                      "visible": false,
                      "_mouseState": 2,
                      "scrollType": 2,
                      "_$child": [
                        {
                          "_$id": "w9oh917n",
                          "_$type": "Panel",
                          "name": "asset_panels",
                          "width": 399,
                          "height": 469,
                          "_mouseState": 2
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "_$id": "uomjuale",
              "_$type": "Panel",
              "name": "item1",
              "width": 399,
              "height": 744,
              "visible": false,
              "_mouseState": 2,
              "scrollType": 2,
              "_$child": [
                {
                  "_$id": "bwqbf0yx",
                  "_$type": "Dialog",
                  "name": "Dialog",
                  "x": 63,
                  "y": 102.00000000000003,
                  "width": 297,
                  "height": 310,
                  "visible": false,
                  "_mouseState": 2,
                  "material": {
                    "_$uuid": "793cffc6-730a-4756-a658-efe98c230292",
                    "_$type": "Material"
                  },
                  "_$child": [
                    {
                      "_$id": "1t27w3gv",
                      "_$type": "Image",
                      "name": "Image",
                      "x": -53,
                      "y": -3,
                      "width": 359,
                      "height": 313,
                      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
                      "color": "#ffffff"
                    }
                  ]
                }
              ]
            },
            {
              "_$id": "loobin7s",
              "_$type": "Panel",
              "name": "item2",
              "width": 399,
              "height": 724,
              "visible": false,
              "_mouseState": 2,
              "scrollType": 2,
              "elasticEnabled": true,
              "_$comp": [
                {
                  "_$type": "c8c89a73-4ee5-4a07-9633-a836d0c31985",
                  "scriptPath": "../src/card_scene.ts",
                  "card_item_prefab": {
                    "_$uuid": "2598f4b3-b9bb-4de5-b7d9-b1dac16b71df",
                    "_$type": "Prefab"
                  },
                  "card_dialog": {
                    "_$ref": "olnkikyh"
                  }
                }
              ],
              "_$child": [
                {
                  "_$id": "olnkikyh",
                  "_$type": "Dialog",
                  "name": "card_dialog",
                  "y": -55,
                  "width": 399,
                  "height": 844,
                  "visible": false,
                  "_mouseState": 2,
                  "autoDestroyAtClosed": true,
                  "_$comp": [
                    {
                      "_$type": "e6bb4225-00cc-4257-9219-5c56e87e46da",
                      "scriptPath": "../src/CardDialog.ts",
                      "collect_progress": {
                        "_$ref": "qrr3lreg"
                      },
                      "close_img": {
                        "_$ref": "tzysg5si"
                      },
                      "upgrade_btn": {
                        "_$ref": "y6th4law"
                      },
                      "card_name_label": {
                        "_$ref": "9toseu8j"
                      },
                      "card_des_label": {
                        "_$ref": "eeq6gg03"
                      },
                      "card_collect_progress_label": {
                        "_$ref": "evwkgfyh"
                      },
                      "collect_tip_label": {
                        "_$ref": "yq3xlo0j"
                      }
                    }
                  ],
                  "_$child": [
                    {
                      "_$id": "niuhnwlz",
                      "_$type": "Panel",
                      "name": "card_panel",
                      "width": 399,
                      "height": 844,
                      "_mouseState": 2,
                      "bgColor": "rgba(83, 83, 83, 0.8941176470588236)",
                      "_$child": [
                        {
                          "_$id": "etzhuk2q",
                          "_$type": "Image",
                          "name": "card_Img",
                          "x": 113.99999999999994,
                          "y": 87.99999999999994,
                          "width": 164,
                          "height": 195,
                          "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
                          "color": "#ffffff"
                        },
                        {
                          "_$id": "oyrkq47e",
                          "_$type": "Panel",
                          "name": "Panel",
                          "x": 23.999999999999986,
                          "y": 281,
                          "width": 363,
                          "height": 302,
                          "_mouseState": 2,
                          "_$child": [
                            {
                              "_$id": "qrr3lreg",
                              "_$type": "ProgressBar",
                              "name": "level_progress",
                              "x": 37,
                              "y": 238,
                              "width": 298,
                              "height": 30,
                              "skin": "res://ae3de75e-ee9f-478d-9f8b-ede75a4fc296",
                              "value": 0.5,
                              "_$child": [
                                {
                                  "_$id": "evwkgfyh",
                                  "_$type": "Label",
                                  "name": "collect_progress_label",
                                  "width": 298,
                                  "height": 30,
                                  "text": "Label",
                                  "fontSize": 20,
                                  "color": "#FFFFFF",
                                  "align": "center",
                                  "valign": "middle",
                                  "padding": "0,0,0,0"
                                },
                                {
                                  "_$id": "yq3xlo0j",
                                  "_$type": "Label",
                                  "name": "collect_tip_label",
                                  "y": -30,
                                  "width": 298,
                                  "height": 30,
                                  "text": "Label",
                                  "fontSize": 20,
                                  "color": "#FFFFFF",
                                  "align": "center",
                                  "valign": "middle",
                                  "padding": "0,0,0,0"
                                }
                              ]
                            },
                            {
                              "_$id": "9toseu8j",
                              "_$type": "Label",
                              "name": "card_name_label",
                              "x": 119,
                              "y": 16,
                              "width": 120,
                              "height": 28,
                              "text": "Label",
                              "fontSize": 20,
                              "color": "#FFFFFF",
                              "align": "center",
                              "valign": "middle",
                              "padding": "0,0,0,0"
                            },
                            {
                              "_$id": "eeq6gg03",
                              "_$type": "Label",
                              "name": "card_desc_label",
                              "x": 54,
                              "y": 79,
                              "width": 268,
                              "height": 81,
                              "text": "Label",
                              "fontSize": 20,
                              "color": "#FFFFFF",
                              "valign": "top",
                              "padding": "0,0,0,0"
                            },
                            {
                              "_$id": "y6th4law",
                              "_$type": "Button",
                              "name": "upgrad_btn",
                              "x": 37,
                              "y": 233,
                              "width": 298,
                              "height": 40,
                              "_mouseState": 2,
                              "skin": "res://d4cfd6a8-0d0a-475b-ac93-d85eaa646936",
                              "label": "Title",
                              "labelSize": 20,
                              "labelAlign": "center",
                              "labelVAlign": "middle"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "_$id": "tzysg5si",
                      "_$type": "Image",
                      "name": "close_img",
                      "x": 343,
                      "y": 290,
                      "width": 32,
                      "height": 34,
                      "skin": "res://dda0809b-cfe4-41b3-a392-8bd79c456ee1",
                      "color": "#ffffff"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "_$id": "zarqj78q",
          "_$type": "Image",
          "name": "footer_tab",
          "x": -1,
          "y": 784,
          "width": 401,
          "height": 65,
          "_mouseState": 2,
          "centerX": 0,
          "color": "#ffffff",
          "_$comp": [
            {
              "_$type": "b69998a9-a350-4ee7-aa28-268239d957ac",
              "scriptPath": "../src/FooterTab.ts",
              "scene_stack": {
                "_$ref": "o37pomui"
              }
            }
          ],
          "_$child": [
            {
              "_$id": "53x4xffm",
              "_$type": "Button",
              "name": "Button",
              "y": 61,
              "width": 70,
              "height": 61,
              "anchorY": 1,
              "_mouseState": 2,
              "skin": "res://d4cfd6a8-0d0a-475b-ac93-d85eaa646936",
              "label": "0",
              "labelSize": 20,
              "labelAlign": "center",
              "labelVAlign": "middle"
            },
            {
              "_$id": "n92vq0sp",
              "_$type": "Button",
              "name": "Button(1)",
              "x": 82,
              "y": 63,
              "width": 70,
              "height": 61,
              "anchorY": 1,
              "_mouseState": 2,
              "skin": "res://d4cfd6a8-0d0a-475b-ac93-d85eaa646936",
              "label": "1",
              "labelSize": 20,
              "labelAlign": "center",
              "labelVAlign": "middle"
            },
            {
              "_$id": "pq3o8l6j",
              "_$type": "Button",
              "name": "Button(2)",
              "x": 166,
              "y": 63,
              "width": 70,
              "height": 61,
              "anchorY": 1,
              "_mouseState": 2,
              "skin": "res://d4cfd6a8-0d0a-475b-ac93-d85eaa646936",
              "label": "2",
              "labelSize": 20,
              "labelAlign": "center",
              "labelVAlign": "middle"
            },
            {
              "_$id": "on56h0h9",
              "_$type": "Button",
              "name": "Button(3)",
              "x": 245,
              "y": 62,
              "width": 70,
              "height": 61,
              "anchorY": 1,
              "_mouseState": 2,
              "skin": "res://d4cfd6a8-0d0a-475b-ac93-d85eaa646936",
              "label": "3",
              "labelSize": 20,
              "labelAlign": "center",
              "labelVAlign": "middle"
            },
            {
              "_$id": "an0no7nd",
              "_$type": "Button",
              "name": "Button(4)",
              "x": 323,
              "y": 61,
              "width": 70,
              "height": 61,
              "anchorY": 1,
              "_mouseState": 2,
              "skin": "res://d4cfd6a8-0d0a-475b-ac93-d85eaa646936",
              "label": "4",
              "labelSize": 20,
              "labelAlign": "center",
              "labelVAlign": "middle"
            }
          ]
        }
      ]
    },
    {
      "_$id": "8drsytqu",
      "_$prefab": "8244a8a9-46a3-4923-b8a3-7934bbd36202",
      "name": "test_card_item",
      "active": true,
      "x": 121,
      "y": 358,
      "visible": true,
      "width": 84,
      "height": 122,
      "scaleX": 2.5,
      "scaleY": 2.5
    }
  ]
}