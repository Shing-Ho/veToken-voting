import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
// import { LedgerConnector } from "@web3-react/ledger-connector";
// import { TrezorConnector } from "@web3-react/trezor-connector";
// import { FrameConnector } from "@web3-react/frame-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { PortisConnector } from "@web3-react/portis-connector";
// import { SquarelinkConnector } from "@web3-react/squarelink-connector";
// import { TorusConnector } from "@web3-react/torus-connector";
// import { AuthereumConnector } from "@web3-react/authereum-connector";
import { NetworkConnector } from "@web3-react/network-connector";

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  250: "https://rpcapi.fantom.network",
  4002: "https://rpc.testnet.fantom.network/"
};

export const network = new NetworkConnector({ urls: { 250: RPC_URLS[250] } });

export const injected = new InjectedConnector({
  supportedChainIds: [250, 4002]
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 250: RPC_URLS[250] },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[250],
  appName: "yearn.finance"
});

// export const fortmatic = new FortmaticConnector({
//   apiKey: "pk_live_F95FEECB1BE324B5",
//   chainId: 250
// });

// export const portis = new PortisConnector({
//   dAppId: "5dea304b-33ed-48bd-8f00-0076a2546b60",
//   networks: [250, 4002]
// });
