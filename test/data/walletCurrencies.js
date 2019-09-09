import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import sinon from 'sinon';
import app from '../../js/app';
import {
  getWalletCurs,
  supportedWalletCurs,
  isSupportedWalletCur,
  onlySupportedWalletCurs,
  anySupportedByWallet,
  getCurrencyByCode,
  init,
} from '../../js/data/walletCurrencies';

const walletCurs = ['BCH', 'BTC'];
const walletCurDef = {
  AED: {
    code: 'AED',
    currencyType: 'fiat',
    divisibility: 2,
    name: 'UAE Dirham',
    testnetCode: '',
  },
  BCH: {
    code: 'BCH',
    currencyType: 'crypto',
    divisibility: 8,
    name: 'Bitcoin Cash',
    testnetCode: 'TBCH',
  },
  BTC: {
    code: 'BTC',
    currencyType: 'crypto',
    divisibility: 8,
    name: 'Bitcoin',
    testnetCode: 'TBTC',
  },
};

let isAppTestnet = false;

describe('the crypto currencies data module', () => {
  let clientCurrencies;
  let currencies;

  before(function () {
    app.serverConfig = {
      get testnet() {
        return isAppTestnet;
      },
    };
    clientCurrencies = getWalletCurs();
    init(walletCurs, walletCurDef);
    currencies = getWalletCurs();
  });

  describe('has a config array of crypto currency configuration objects', () => {
    it('that don\'t include fiat currencies from the wallet currency definition', () => {
      expect(!!getCurrencyByCode('AED')).to.equal(false);
    });

    it('that includes only currencies which are in all 3 of: the client wallet currencies ' +
      'config, crypto currencies from the wallet currency definition and currencies in the ' +
      'server config wallets list', () => {
      let allGood = true;

      for (let i = 0; i < currencies.length; i++) {
        const cur = currencies[i].code;

        const inClientConfig = !!(
          clientCurrencies.find(clientCur => !!clientCur.code === cur)
        );

        if (!(
          inClientConfig &&
          walletCurs.includes(cur) &&
          walletCurDef[cur] &&
          walletCurDef[cur].currencyType === 'crypto'
        )) {
          allGood = false;
          break;
        }

        expect(allGood.to.equal(true));
      }
    });

    it('that requires a code to be provided as a string', () => {
      currencies.forEach(cur => {
        expect(typeof cur.code).to.equal('string');
      });
    });

    it('that, if provided, requires the testnetCode to be a string', () => {
      currencies.forEach(cur => {
        if (cur.testnetCode !== undefined) {
          expect(typeof cur.testnetCode).to.equal('string');
        }
      });
    });

    it('that, if provided, requires the symbol to be a string', () => {
      currencies.forEach(cur => {
        if (cur.symbol !== undefined) {
          expect(typeof cur.symbol).to.equal('string');
        }
      });
    });

    it('that requires the divisibility to be a number >= 0', () => {
      currencies.forEach(cur => {
        expect(typeof cur.coinDivisibility === 'number' && cur.coinDivisibility >= 0)
          .to
          .equal(true);
      });
    });

    it('that requires the averageModeratedTransactionSize to be a number > 0', () => {
      currencies.forEach(cur => {
        expect(typeof cur.averageModeratedTransactionSize === 'number' &&
          cur.averageModeratedTransactionSize > 0).to.equal(true);
      });
    });

    it('that requires the feeBumpTransactionSize to be undefined or a number > 0', () => {
      currencies.forEach(cur => {
        expect(typeof cur.feeBumpTransactionSize === 'undefined' ||
          (typeof cur.feeBumpTransactionSize === 'number' &&
          cur.feeBumpTransactionSize > 0)).to.equal(true);
      });
    });

    it('that requires the qrCodeText to be a function', () => {
      currencies.forEach(cur => {
        expect(typeof cur.qrCodeText).to.equal('function');
      });
    });

    it('that, if provided, requires the icon to be a string', () => {
      currencies.forEach(cur => {
        if (cur.icon !== undefined) {
          expect(typeof cur.icon).to.equal('string');
        }
      });
    });

    it('that, if provided, requires the needCoinLink to be a string', () => {
      currencies.forEach(cur => {
        if (cur.needCoinLink !== undefined) {
          expect(typeof cur.needCoinLink).to.equal('string');
        }
      });
    });

    it('that requires the getBlockChainAddressUrl to be a function', () => {
      currencies.forEach(cur => {
        expect(typeof cur.getBlockChainAddressUrl).to.equal('function');
      });
    });

    it('that requires the getBlockChainTxUrl to be a function', () => {
      currencies.forEach(cur => {
        expect(typeof cur.getBlockChainTxUrl).to.equal('function');
      });
    });

    it('that requires the getBlockChainTxUrl to be a function', () => {
      currencies.forEach(cur => {
        expect(typeof cur.getBlockChainTxUrl).to.equal('function');
      });
    });

    it('that, if provided, requires isValidAddress to be a function', () => {
      currencies.forEach(cur => {
        if (cur.isValidAddress !== undefined) {
          expect(typeof cur.isValidAddress).to.equal('function');
        }
      });
    });

    it('that, if provided, requires isValidAddress to be a function that returns a boolean ' +
      'or throws an exception', () => {
      currencies.forEach(cur => {
        if (cur.isValidAddress !== undefined) {
          let isValid;
          let exceptionThrown = false;

          try {
            isValid = cur.isValidAddress('abcdefghijklmnop');
          } catch (e) {
            exceptionThrown = true;
          }

          expect(typeof isValid === 'boolean' || exceptionThrown).to.equal(true);
        }
      });
    });

    it('that requires supportsEscrowTimeout to be a boolean', () => {
      currencies.forEach(cur => {
        expect(typeof cur.supportsEscrowTimeout).to.equal('boolean');
      });
    });

    it('that, if provided, requires blockTime to be a number', () => {
      currencies.forEach(cur => {
        if (cur.blockTime !== undefined) {
          expect(typeof cur.blockTime).to.equal('number');
        }
      });
    });
  });

  describe('has a supportedWalletCurs function', () => {
    it('that will return testnet codes if the app module servere config ' +
      'identifies the app as being on testnet', () => {
      const curs = currencies.map(cur => cur.testnetCode);
      isAppTestnet = true;


      expect(supportedWalletCurs())
        .deep
        .equal([...curs]);

      isAppTestnet = false;
    });

    it('that will return testnet codes if you pass in a testnet true option', () => {
      const curs = currencies.map(cur => cur.testnetCode);

      expect(supportedWalletCurs({ testnet: true }))
        .deep
        .equal([...curs]);
    });

    it('that by default will return a list of mainet currency codes', () => {
      const curs = currencies.map(cur => cur.code);

      expect(supportedWalletCurs())
        .deep
        .equal([...curs]);
    });
  });

  describe('has a isSupportedWalletCur function', () => {
    it('that will return false if the given currency is not a supported wallet ' +
      'currency', () => {
      expect(
        isSupportedWalletCur('NO-SOUP-FOR-YOU', {
          clientSupported: false,
          serverCurs: [currencies[0].code],
        })
      ).deep.equal(false);
    });

    it('that will return true if the given currency is a supported wallet ' +
      'currency', () => {
      expect(
        isSupportedWalletCur('SOUP-FOR-YOU', {
          clientSupported: false,
          serverCurs: ['SOUP-FOR-YOU'],
        })
      ).deep.equal(true);
    });

    it('that, if passing in a "true" clientSupported option, will return false ' +
      'if the given currency is not a currency enumerated in the ' +
      'walletCurrencies data file', () => {
      expect(
        isSupportedWalletCur('NOT-CLIENT-SUPPORTED', {
          clientSupported: true,
          serverCurs: [currencies[0].code, 'NOT-CLIENT-SUPPORTED'],
        })
      ).deep.equal(false);
    });
  });

  describe('has a onlySupportedWalletCurs function that takes a list of currencies', () => {
    it('and returns only the ones that are supported wallet currencies', () => {
      expect(
        onlySupportedWalletCurs(['PICKLES', 'BTC', 'BCH', 'SANDY', 'WINE'])
      ).deep.equal(['BTC', 'BCH']);
    });

    it('and returns an empty list if none of them are supported wallet ' +
      'currencies', () => {
      expect(
        onlySupportedWalletCurs(['HI', 'THERE', 'SLICK', 'WILLY'])
      ).deep.equal([]);
    });

    it('and uses testnet codes if we provide a testnet option of true', () => {
      const curs = currencies.map(cur => cur.code);
      expect(
        onlySupportedWalletCurs([...curs, 'NO-SOUP-FOR-YOU'], {
          clientSupported: true,
          serverCurs: [...curs],
        })
      ).deep.equal([...curs]);
    });
  });

  describe('has a anySupportedByWallet function that takes a list of currencies', () => {
    it('and returns true if any of them are supported wallet currencies', () => {
      expect(
        anySupportedByWallet(['WIGGLES', 'YES', 'HI', 'NO'], {
          clientSupported: false,
          serverCurs: ['HI', 'THERE', 'WILLY'],
        })
      ).deep.equal(true);
    });

    it('and returns false if none of them are supported wallet currencies', () => {
      expect(
        anySupportedByWallet(['WIGGLES', 'YES', 'TRUST', 'NO'], {
          clientSupported: false,
          serverCurs: ['HI', 'THERE', 'WILLY'],
        })
      ).deep.equal(false);
    });

    it('and returns true if any of them are supported wallet currencies ' +
      'factoring in client support if "true" is passed in for the ' +
      'clientSupported option', () => {
      const curs = currencies.map(cur => cur.code);
      expect(
        anySupportedByWallet([curs[0], 'NO', 'MO', 'PICKLES'], {
          clientSupported: true,
          serverCurs: [...curs],
        })
      ).deep.equal(true);
    });

    it('and returns false if none of them are supported wallet currencies ' +
      'factoring in client support if "true" is passed in for the ' +
      'clientSupported option', () => {
      expect(
        anySupportedByWallet(['NO-SOUP-FOR-YOU'], {
          clientSupported: true,
          serverCurs: ['NO-SOUP-FOR-YOU'],
        })
      ).deep.equal(false);
    });
  });
});
