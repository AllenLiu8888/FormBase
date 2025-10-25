module.exports = function (api) {
  api.cache(true);
  return {
    // 按官方文档：将 nativewind 作为 preset 放入 presets 数组
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};


