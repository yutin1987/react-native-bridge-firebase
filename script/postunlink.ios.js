const glob = require("glob");
const xcode = require('xcode');
const fs = require('fs');

const ignoreNodeModules = { ignore: "node_modules/**" };
const pbxprojPaths = glob.sync("**/*.pbxproj", ignoreNodeModules);
const pbxproj = xcode.project(pbxprojPaths[0]);
const frameworkPath = '../node_modules/react-native-bridge-firebase/ios/Frameworks/';

pbxproj.parse((err) => {
  const frameworks = fs
    .readdirSync(__dirname + '/../ios/Frameworks/')
    .filter(file => /.framework$/.test(file));

  for (var i = 0; i < frameworks.length; i++) {
    pbxproj.removeFramework(frameworkPath + frameworks[i], { customFramework: true });
  }

  const config = pbxproj.pbxXCBuildConfigurationSection();

  Object
    .keys(config)
    .filter(ref => ref.indexOf('_comment') === -1)
    .forEach(ref => {
      const buildSettings = config[ref].buildSettings;
      const shouldVisitBuildSettings = (
          Array.isArray(buildSettings.HEADER_SEARCH_PATHS) ?
            buildSettings.HEADER_SEARCH_PATHS : []
        )
        .filter(path => path.indexOf('react-native/React/**') >= 0)
        .length > 0;

      if (shouldVisitBuildSettings) {
        const searchPaths = (
            Array.isArray(buildSettings.FRAMEWORK_SEARCH_PATHS) ?
            buildSettings.FRAMEWORK_SEARCH_PATHS : []
          )
          .filter(folder => folder !== '"$(SRCROOT)/' + frameworkPath + '"');

        buildSettings.FRAMEWORK_SEARCH_PATHS = searchPaths;
      }
    });

  fs.writeFileSync(pbxprojPaths[0], pbxproj.writeSync());
});
