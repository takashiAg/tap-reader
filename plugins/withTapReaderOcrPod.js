const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const podLine = "  pod 'TapReaderOcr', :path => '../modules/tap-reader-ocr/ios'";

module.exports = function withTapReaderOcrPod(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      if (!podfile.includes(podLine)) {
        podfile = podfile.replace('  use_expo_modules!\n', `  use_expo_modules!\n${podLine}\n`);
        fs.writeFileSync(podfilePath, podfile);
      }

      return config;
    },
  ]);
};
