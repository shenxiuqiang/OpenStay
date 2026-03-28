/* eslint-disable import/no-extraneous-dependencies */
import { DID_TYPE_ARCBLOCK } from '@arcblock/did';
import { fromAppDid } from '@arcblock/did-ext';
import { WalletObject } from '@ocap/wallet';
import * as bip39Module from 'bip39';

// bip39 is a CommonJS module, handle default export
const bip39 = (bip39Module as { default?: typeof bip39Module } & typeof bip39Module).default || bip39Module;

export default class WalletUtil {
  static generateWalletFromMnemonic(mnemonic: string): WalletObject<Uint8Array> {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic');
    }
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const rootSk = `0x${seed.toString('hex')}`;
    return fromAppDid('', rootSk, DID_TYPE_ARCBLOCK, 0);
  }

  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }
}
