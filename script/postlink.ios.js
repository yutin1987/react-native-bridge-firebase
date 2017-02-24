const glob = require("glob");
const xcode = require('xcode');
const fs = require('fs');

const INHERITED = '"$(inherited)"';

const ignoreFolders = { ignore: "node_modules/**" };
const pbxprojPaths = glob.sync("**/*.pbxproj", ignoreFolders);
const pbxproj = xcode.project(pbxprojPaths[0]);
const frameworkPath = '../node_modules/react-native-bridge-firebase/ios/Frameworks/';

pbxproj.parse((err) => {
  const frameworks = fs
    .readdirSync(__dirname + '/../ios/Frameworks/')
    .filter(file => /.framework$/.test(file));

  const mainGroup = pbxproj.getFirstProject().firstProject.mainGroup;
  if (!pbxproj.pbxGroupByName('Frameworks')) {
    const uuid = pbxproj.pbxCreateGroup('Frameworks', '""');
    pbxproj.getPBXGroupByKey(mainGroup).children.push({
      value: uuid, comment: 'Frameworks',
    });
  }

  const target = pbxproj.getFirstTarget().uuid;

  for (var i = 0; i < frameworks.length; i++) {
    pbxproj.addFramework(frameworkPath + frameworks[i], { target, customFramework: true });
  }

  const config = pbxproj.pbxXCBuildConfigurationSection();

  Object
    .keys(config)
    .filter(ref => ref.indexOf('_comment') === -1)
    .forEach(ref => {
      const buildSettings = config[ref].buildSettings;
      const shouldVisitBuildSettings = (
          Array.isArray(buildSettings.OTHER_LDFLAGS) ?
            buildSettings.OTHER_LDFLAGS :
            []
        )
        .indexOf('"-lc++"') >= 0;

      if (shouldVisitBuildSettings) {
        const searchPaths = (
            Array.isArray(buildSettings.FRAMEWORK_SEARCH_PATHS) ?
            buildSettings.FRAMEWORK_SEARCH_PATHS : []
          )
          .filter(folder => folder !== '"$(SRCROOT)/' + frameworkPath + '"');

        buildSettings.FRAMEWORK_SEARCH_PATHS = searchPaths.concat('"$(SRCROOT)/' + frameworkPath + '"');
      }
    });

  fs.writeFileSync(pbxprojPaths[0], pbxproj.writeSync());
});
