require("../../../../src/index");

module.exports = {
  vyper: {
    compilers: [
      {
        version: "0.3.0",
        settings: {
          evmVersion: "istanbul",
          optimize: false,
        },
      },
    ],
  },
};
