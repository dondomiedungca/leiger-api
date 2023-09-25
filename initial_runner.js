const crypto = require('crypto');
const fs = require('fs');

const command = async () => {
  let [selectedEnv] = process.argv.slice(2);

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  const publicDir =
    __dirname + `/configurations/keys/public.${selectedEnv}.key.pem`;
  const privateDir =
    __dirname + `/configurations/keys/private.${selectedEnv}.key.pem`;

  if (!fs.existsSync(__dirname + '/configurations/keys'))
    fs.mkdirSync(__dirname + '/../../configurations/keys', {
      recursive: true,
    });

  fs.writeFileSync(publicDir, publicKey);
  fs.writeFileSync(privateDir, privateKey);

  return;
};

command();
