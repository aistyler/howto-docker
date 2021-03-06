/**
 * ###################################################
 * #
 * # PM2 Config
 * #
 * ###################################################
 */

// ###################################################
// # Constants
// ###################################################

const PROJECT_NAME = "webapp";
const INSTANCE_COUNT = process.env.INSTANCE_COUNT || 1; // 0: the maximum processes possible according to the numbers of CPUs (cluster mode)
const LOG_DIR = process.env.LOG_DIR || './tmp/log';

const deployConfig = {
  SVC_USER: "svc00",
  SVC_SERVER: "127.0.0.1",
  GIT_BRANCH: "origin/master",
  GIT_REPO: __dirname,
  DEST_PATH: `/srv/prod/${PROJECT_NAME}`,
};

// ###################################################
// # EXPORT
// ###################################################

const deployCommon = {
  user: deployConfig.SVC_USER,
  host: [deployConfig.DEST_PATH],//deployConfig.SVC_SERVER,
  ref: deployConfig.GIT_BRANCH,
  repo: deployConfig.GIT_REPO,
  path: deployConfig.DEST_PATH,
  "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
};

const post_setup = [
  // PWD: ${prodDir}/source (== WORKING_DIR)
  //'git submodule init strapi',
  'mkdir -p ../shared/logs',
];

const post_deploy = [
  //'git submodule update strapi',
  'yarn install --production --frozen-lockfile',
];

// See https://pm2.keymetrics.io/docs/usage/watch-and-restart/
const watch_options = {
  watch: process.env.NODE_ENV === 'production' ? false : ['src'],
  // Delay between restart
  watch_delay: 1000,
  ignore_watch: [ "node_modules", "tmp", "tests", "**/*.(spec|test).[tj]s" ],
  watch_options: {
    "followSymlinks": false
  }
};

module.exports = {
  apps: [
    {
      name: PROJECT_NAME,
      script: './src/index.js',
      args: '',
      instances: INSTANCE_COUNT,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      log_date_format: 'YY-MM-DD HH:mm:ss',    
      error_file: `${LOG_DIR}/error.log`,
      out_file: `${LOG_DIR}/access.log`, // disable: "/dev/null"
      ...watch_options,
    },
  ],
  
  deploy : {
    production : { ...deployCommon,
      env: {
        NODE_ENV: "production"
      },
      "post-setup": post_setup.join(" && "),
      "post-deploy" : post_deploy.join(" && "),
    },
  }
};
