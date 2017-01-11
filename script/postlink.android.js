const fs = require('fs');
const glob = require("glob");
const path = require('path');

const ignoreFolders = { ignore: ["node_modules/**", "**/build/**"] };

const appBuildGradlePath = path.join("android", "app", "build.gradle");
fs.writeFileSync(appBuildGradlePath, fs
  .readFileSync(appBuildGradlePath, 'utf8')
  .replace(/.+com.google.firebase:firebase-core.+\n?/, '')
  .replace(
    /.+com.facebook.react:react-native.+\n?/,
    match => `${match}    compile 'com.google.firebase:firebase-core:10.0.1'\n`
  )
  .replace(/\n?.*apply plugin: 'com.google.gms.google-services'\n?/, '')
  + '\napply plugin: \'com.google.gms.google-services\'\n'
);

const buildGradlePath = path.join("android", "build.gradle");
fs.writeFileSync(buildGradlePath, fs
  .readFileSync(buildGradlePath, 'utf8')
  .replace(/.*com.google.gms:google-services.+\n?/, '')
  .replace(
    /com.android.tools.build:gradle.+\n?/,
    match => `${match}        classpath 'com.google.gms:google-services:3.0.0'\n`
  )
);
