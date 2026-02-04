import { Client, Wallet, NFTokenMint, convertStringToHex } from "xrpl";

const TESTNET_URL = process.env.NEXT_PUBLIC_XRPL_NETWORK || "wss://s.altnet.rippletest.net:51233";

export class XRPLService {
  private client: Client;

  constructor() {
    this.client = new Client(TESTNET_URL);
  }

  async connect() {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.client.isConnected()) {
      await this.client.disconnect();
    }
  }

  async getBalance(address: string): Promise<string> {
    await this.connect();
    const response = await this.client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
    return response.result.account_data.Balance;
  }

  async mintMPTInvoice(
    wallet: Wallet,
    uri: string, // Invoice data as URI (e.g., JSON IPFS link or memo)
    transferable: boolean = true
  ) {
    await this.connect();
    const nftMint: NFTokenMint = {
      TransactionType: "NFTokenMint",
      Account: wallet.address,
      URI: convertStringToHex(uri),
      Flags: transferable ? 8 : 0, // 8 for transferable
      NFTokenTaxon: 0, // Arbitrary taxon
    };
    const prepared = await this.client.autofill(nftMint);
    const signed = wallet.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);
    return result;
  }

  createWalletFromSeed(seed: string): Wallet {
    return Wallet.fromSeed(seed);
  }

  async fundTestWallet(): Promise<Wallet> {
    await this.connect();
    const { wallet } = await this.client.fundWallet();
    return wallet;
  }
}

export const xrplService = new XRPLService();