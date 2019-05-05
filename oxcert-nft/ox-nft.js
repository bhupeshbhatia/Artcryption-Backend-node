import { Cert } from "@0xcert/cert";
import { schema88 } from "@0xcert/conventions";
import {
  AssetLedger,
  AssetLedgerCapability
} from "@0xcert/ethereum-asset-ledger";
import { MetamaskProvider } from "@0xcert/ethereum-metamask-provider";

import Web3 from "web3";

const provider = new MetamaskProvider();
const ledger = {};

// To set a metamask provider
export const setProvider = async () => {
  //   const provider = new MetamaskProvider();
  if (!(await provider.isEnabled())) {
    await provider.enable();
  }
};

// To set the ledger as a state object
export const setExistingLedger = async newLedger => {
  const ledgerAddress = newLedger;
  const ledger = AssetLedger.getInstance(this.provider, ledgerAddress);
  return await ledger;
};

// To create a new asset ledger containing several assets and managed by several individuals
// The asset ledger is mandatory to create new assets since they need a place to be stored, they can't exist without a ledger
export const deployNewLedger = async () => {
  let deployedLedger = {};

  // The required keys are name, symbol, uriBase and schemaId
  const recipe = {
    // SchemaID is required for deploying asset ledger. It is one of the conventions used by 0xcert to allow dApp to communicate with other dApps using same standard. Schema 88 defines information about crypto-collectibles so that we can use ERC721 tokens from other applications as well.
    capabilities: [
      AssetLedgerCapability.DESTROY_ASSET,
      AssetLedgerCapability.UPDATE_ASSET,
      AssetLedgerCapability.TOGGLE_TRANSFERS,
      AssetLedgerCapability.REVOKE_ASSET
    ],
    name: "Artcryption-NFT",
    schemaId:
      "0xa4cf0407b223849773430feaf0949827373c40feb3258d82dd605ed41c5e9a2c", // This is the ID from schema88 available at https://github.com/0xcert/framework/blob/master/conventions/88-crypto-collectible-schema.md
    symbol: "ART",
    uriBase: "" // setup a server for generating tokens to this URI
  };

  try {
    deployedLedger = await AssetLedger.deploy(this.provider, recipe).then(
      mutation => {
        console.log("Deploying new asset ledger, it may take a few minutes.");
        return mutation.complete();
      }
    );
    console.log("Ledger: ", deployedLedger);
  } catch (e) {
    console.log("Error: ", e);
  }

  if (deployedLedger.isCompleted()) {
    console.log("Ledger address: ", deployedLedger.receiverId);
    return deployedLedger.receiverId;
  }
};

// To deploy a new asset
export const deployArtAsset = async (details, ledger) => {
  const cert = new Cert({
    schema: schema88
  });
  // In the final application we'll want to dynamically generate the asset parameters to create new assets with different imprints
  const asset = {
    id: details.id,
    description: details.description,
    image: details.url,
    name: details.name
  };
  const imprint = await cert.imprint(asset);
  console.log("New imprint", imprint);
  // const assetId = parseInt(await this.getUserBalance()) + 1
  // console.log('id', assetId)
  await ledger
    .createAsset({
      id: asset.id,
      imprint: imprint, // You must generate a new imprint for each asset
      receiverId: web3.eth.accounts[0]
    })
    .then(mutation => {
      console.log("Creating new asset, this may take a while...");
      return mutation.complete();
    })
    .then(result => {
      console.log("Deployed!");
      this.setAssetArray(); // Update the user interface to show the deployed asset
    })
    .catch(e => {
      console.log("Error", e);
    });
};

// To get user ERC721 token balance
export const getUserBalance = async ledger => {
  const balance = await ledger.getBalance(web3.eth.accounts[0]);
  return balance;
};

// To configure new ERC721 assets
export const displayBlueprint = async details => {
  const cert = new Cert({
    schema: schema88
  });
  const asset = {
    id: details.id,
    description: details.description,
    image: details.url,
    name: details.name
  };
  // The imprint is the hashed proof for our asset
  console.log("Imprint", await cert.imprint(asset));
  console.log("Expose", await cert.expose(asset, [["name"], ["image"]]));
};
