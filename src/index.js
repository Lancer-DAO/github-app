/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  Connection,
  sendAndConfirmTransaction,
  clusterApiUrl,
} = require("@solana/web3.js");

const WALLET_ID = "**wallet:";
const AMOUNT_ID = "**amount:";
const USDC_MULTIPLIER = 1000000;

const {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");

const SOLANA_MAINNET_USDC_PUBKEY =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const SOLANA_DEVNET_USDC_PUBKEY =
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";

const TO_DEVNET_PUBKEY = "Ff7QraTvRcQodsoVoFjdxQijcMnyL35q5gZEkP4gjkEa";
const TO_MAINNET_PUBKEY = "DntRzbhp6AfJUHPAAVKVtMqo2fUM4QCes7JtH2Zcw8Y2";

const FROM_DEVNET_PUBKEY = "3qMszdRNjJFYtn8jujEL7upFNvNSNp9cS4CBPut8KVYp";
const FROM_MAINNET_PUBKEY = "FTeMDcLCCn6ddWCgy4oq9WYGihfgY9soAU9KYLkaDPRq";

const isMainnet = false;
const USDC_AMOUNT = 1;

const sendUSDC = async (fromWallet, toWallet, amount, connection, app) => {
  var USDC_pubkey = new PublicKey(
    isMainnet ? SOLANA_MAINNET_USDC_PUBKEY : SOLANA_DEVNET_USDC_PUBKEY
  );
  app.log.info(fromWallet.publicKey.toString());
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    USDC_pubkey,
    toWallet
  );

  // var toTokenAccount = toWallet;
  console.log(
    "toTokenAccount",
    toTokenAccount.address.toString(),
    toTokenAccount.owner.toString()
  );
  var fromTokenAccount = new PublicKey(
    isMainnet ? FROM_MAINNET_PUBKEY : FROM_DEVNET_PUBKEY
  );
  app.log.info("from", fromTokenAccount.toString());

  app.log.info("to", toTokenAccount.toString());

  const TransactionInstruction = createTransferInstruction(
    fromTokenAccount,
    toTokenAccount.address,
    fromWallet.publicKey,
    amount * USDC_MULTIPLIER,
    [fromWallet]
  );

  let transaction = new Transaction();
  transaction.add(TransactionInstruction);
  app.log.info("Sending funds!");

  sendAndConfirmTransaction(connection, transaction, [fromWallet]);
  app.log.info("Funds sent");
};

const convertSecretKeyString = (secret) => {
  const nums = secret.split(", ");
  const secretArray = nums.map((val) => parseInt(val));
  return secretArray;
};

module.exports = (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!");

  let secretKey = Uint8Array.from(
    convertSecretKeyString(process.env.WALLET_SECRET_KEY)
  );

  let keypair = Keypair.fromSecretKey(secretKey);
  console.log(keypair.publicKey.toString());

  const receipient = new PublicKey(
    "BuxU7uwwkoobF8p4Py7nRoTgxWRJfni8fc4U3YKGEXKs"
  );
  let connection = new Connection(
    clusterApiUrl(isMainnet ? "mainnet-beta" : "devnet")
  );

  // sendUSDC(keypair, receipient, 10, connection, app);

  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    return context.octokit.issues.createComment(issueComment);
  });

  app.on("issues.closed", async (context) => {
    app.log.info("Creating transaction");
    const issueParams = context.issue();
    const issueData = await context.octokit.issues.get(issueParams);
    const issueBody = issueData.data.body;
    console.log("issueBody: ", issueBody);

    try {
      const end = issueBody.split("+start+")[1];
      const full = end.split("+end+")[0];
      console.log("end, full", end, full);
      const rawData = JSON.parse(full);
      console.log("rawData", rawData);
      const payoutValue = rawData.payout;
      rawData.wallets.forEach((element) => {
        const walletAddr = new PublicKey(element.publicKey);
        const usdcAmount = (payoutValue * element.cut) / 100;
        console.log(`wallet: ${walletAddr.toString()}`);
        console.log(`amount: ${usdcAmount}`);
        sendUSDC(keypair, walletAddr, usdcAmount, connection, app);
      });
    } catch (error) {
      console.log(error);
    }

    // const issueComment = context.issue({
    //   body: "Thanks for closing this issue! You just got paid :)",
    // });
    // return context.octokit.issues.createComment(issueComment);
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
