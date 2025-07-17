export interface IOSEntry {
  TID: string;
  Versions: Record<string, number[]>;
  Danger?: string;
  sha1?: string;
}

export const iosDatabase = {
  IOS4: {
    TID: "0000000100000004",
    Versions: { World: [65280] },
    Danger:
      "This IOS is a stub, and no longer offers any functionality. It cannot be used to run any code.",
  },
  IOS9: {
    TID: "0000000100000009",
    Versions: { World: [520, 521, 778, 1034] },
  },
  IOS10: {
    TID: "000000010000000A",
    Versions: { World: [768] },
  },
  IOS11: {
    TID: "000000010000000B",
    Versions: { World: [10, 256] },
    Danger:
      "Version 256 of IOS 11 is a stub, and no longer offers any functionality. It cannot be used to run any code. If you're using System Menu 2.0-2.1, DO NOT install version 256, as the System Menu relies on IOS 11.",
  },
  IOS12: {
    TID: "000000010000000C",
    Versions: { World: [6, 11, 12, 269, 525, 526] },
  },
  IOS13: {
    TID: "000000010000000D",
    Versions: { World: [10, 15, 16, 273, 1031, 1032] },
  },
  IOS14: {
    TID: "000000010000000E",
    Versions: { World: [262, 263, 520, 1031, 1032] },
  },
  IOS15: {
    TID: "000000010000000F",
    Versions: {
      World: [257, 258, 259, 260, 265, 266, 523, 1031, 1032],
    },
  },
  IOS16: {
    TID: "0000000100000010",
    Versions: { World: [512] },
    Danger:
      "This IOS is a stub, and no longer offers any functionality. It cannot be used to run any code.",
  },
  IOS17: {
    TID: "0000000100000011",
    Versions: { World: [512, 517, 518, 775, 1031, 1032] },
  },
  IOS20: {
    TID: "0000000100000014",
    Versions: { World: [12, 256] },
    Danger:
      "Version 256 of IOS 20 is a stub, and no longer offers any functionality. It cannot be used to run any code. If you're using System Menu 2.2, DO NOT install version 256, as the System Menu relies on IOS 20.",
  },
  IOS21: {
    TID: "0000000100000015",
    Versions: {
      World: [514, 515, 516, 517, 522, 525, 782, 1038, 1039],
    },
  },
  IOS22: {
    TID: "0000000100000016",
    Versions: { World: [777, 780, 1037, 1293, 1294] },
  },
  IOS28: {
    TID: "000000010000001C",
    Versions: { World: [1292, 1293, 1550, 1806, 1807] },
  },
  IOS30: {
    TID: "000000010000001E",
    Versions: { World: [1037, 1039, 1040, 2576, 2816] },
    Danger:
      "Version 2816 of IOS 30 is a stub, and no longer offers any functionality. It cannot be used to run any code. If you're using System Menu 3.0-3.3, DO NOT install version 2816, as the System Menu relies on IOS 30.",
  },
  IOS31: {
    TID: "000000010000001F",
    Versions: {
      World: [1037, 1039, 1040, 2576, 3088, 3092, 3349, 3607, 3608],
    },
  },
  IOS33: {
    TID: "0000000100000021",
    Versions: { World: [1040, 2832, 2834, 3091, 3607, 3608] },
  },
  IOS34: {
    TID: "0000000100000022",
    Versions: { World: [1039, 3087, 3091, 3348, 3607, 3608] },
  },
  IOS35: {
    TID: "0000000100000023",
    Versions: { World: [1040, 3088, 3092, 3349, 3607, 3608] },
  },
  IOS36: {
    TID: "0000000100000024",
    Versions: { World: [1042, 3090, 3094, 3351, 3607, 3608] },
  },
  IOS37: {
    TID: "0000000100000025",
    Versions: { World: [2070, 3609, 3612, 3869, 5662, 5663] },
  },
  IOS38: {
    TID: "0000000100000026",
    Versions: { World: [3610, 3867, 4123, 4124] },
  },
  IOS40: {
    TID: "0000000100000028",
    Versions: { World: [3072] },
    Danger:
      "Version 3072 of IOS 40 is a stub, and no longer offers any functionality. It cannot be used to run any code. If you're using System Menu 3.3K, DO NOT install version 3072, as the System Menu relies on IOS 40.",
  },
  IOS41: {
    TID: "0000000100000029",
    Versions: { World: [2835, 3091, 3348, 3606, 3607] },
  },
  IOS43: {
    TID: "000000010000002B",
    Versions: { World: [2835, 3091, 3348, 3606, 3607] },
  },
  IOS45: {
    TID: "000000010000002D",
    Versions: { World: [2835, 3091, 3348, 3606, 3607] },
  },
  IOS46: {
    TID: "000000010000002E",
    Versions: { World: [2837, 3093, 3350, 3606, 3607] },
  },
  IOS48: {
    TID: "0000000100000030",
    Versions: { World: [4123, 4124] },
  },
  IOS50: {
    TID: "0000000100000032",
    Versions: { World: [4889, 5120] },
    Danger:
      "Version 5120 of IOS 50 is a stub, and no longer offers any functionality. It cannot be used to run any code. If you're using System Menu 3.3K, DO NOT install version 5120, as the System Menu relies on IOS 50.",
  },
  IOS51: {
    TID: "0000000100000033",
    Versions: { World: [4633, 4864] },
    Danger:
      "Version 4864 of IOS 51 is a stub, and no longer offers any functionality. It cannot be used to run any code.",
  },
  IOS52: {
    TID: "0000000100000034",
    Versions: { World: [5661, 5888] },
    Danger:
      "Version 5888 of IOS 50 is a stub, and no longer offers any functionality. It cannot be used to run any code. If you're using System Menu 3.5, DO NOT install version 5888, as the System Menu relies on IOS 50.",
  },
  IOS53: {
    TID: "0000000100000035",
    Versions: { World: [4113, 5149, 5406, 5662, 5663] },
  },
  IOS55: {
    TID: "0000000100000037",
    Versions: { World: [4633, 5149, 5406, 5662, 5663] },
  },
  IOS56: {
    TID: "0000000100000038",
    Versions: { World: [4890, 5405, 5661, 5662] },
    sha1: "077155E101F1F1675E7B87955379E0522F0798DF",
  },
  IOS57: {
    TID: "0000000100000039",
    Versions: { World: [5404, 5661, 5918, 5919] },
  },
  IOS58: {
    TID: "000000010000003A",
    Versions: { World: [6175, 6176] },
  },
  IOS59: {
    TID: "000000010000003B",
    Versions: { World: [8737, 9249] },
  },
  IOS60: {
    TID: "000000010000003C",
    Versions: { World: [6174, 6400] },
    Danger:
      "Version 6400 of IOS 60 is a stub, and no longer offers any functionality. It cannot be used to run any code. If you're using System Menu 4.0 or 4.1, DO NOT install version 6400, as the System Menu relies on IOS 60.",
  },
  IOS61: {
    TID: "000000010000003D",
    Versions: { World: [4890, 5405, 5661, 5662] },
  },
  IOS62: {
    TID: "000000010000003E",
    Versions: { World: [6430] },
  },
  IOS70: {
    TID: "0000000100000046",
    Versions: { World: [6687, 6912] },
    Danger:
      "Version 6912 of IOS 70 is a stub, and no longer offers any functionality. It cannot be used to run any code. If you're using System Menu 4.2, DO NOT install version 6912, as the System Menu relies on IOS 70.",
  },
  IOS80: {
    TID: "0000000100000050",
    Versions: { World: [6943, 6944] },
    Danger:
      "IOS 80 is the IOS that the final System Menu, 4.3, relies on, and is required to load the System Menu. Do not modify or remove this IOS unless you have BootMii installed as boot2 to recover from a brick.",
  },
  IOS222: {
    TID: "00000001000000DE",
    Versions: { World: [65280] },
    Danger:
      "This IOS is a stub, and offers no functionality. It cannot be used to run any code.",
  },
  IOS223: {
    TID: "00000001000000DF",
    Versions: { World: [65280] },
    Danger:
      "This IOS is a stub, and offers no functionality. It cannot be used to run any code.",
  },
  IOS249: {
    TID: "00000001000000F9",
    Versions: { World: [65280] },
    Danger:
      "This IOS is a stub, and offers no functionality. It cannot be used to run any code.",
  },
  IOS250: {
    TID: "00000001000000FA",
    Versions: { World: [65280] },
    Danger:
      "This IOS is a stub, and offers no functionality. It cannot be used to run any code.",
  },
  IOS254: {
    TID: "00000001000000FE",
    Versions: { World: [2, 3, 260, 65280] },
    Danger:
      "This IOS is a stub, and offers no functionality. It cannot be used to run any code.",
  },
} satisfies Record<string, IOSEntry>;
