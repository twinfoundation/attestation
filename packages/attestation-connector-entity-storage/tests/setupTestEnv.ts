// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { Is } from "@twin.org/core";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import {
	EntityStorageIdentityConnector,
	type IdentityDocument,
	initSchema as initSchemaIdentity
} from "@twin.org/identity-connector-entity-storage";
import { IdentityConnectorFactory } from "@twin.org/identity-models";
import { nameof } from "@twin.org/nameof";
import {
	EntityStorageNftConnector,
	initSchema as initSchemaNft,
	type Nft
} from "@twin.org/nft-connector-entity-storage";
import { NftConnectorFactory } from "@twin.org/nft-models";
import {
	EntityStorageVaultConnector,
	type VaultKey,
	type VaultSecret,
	initSchema as initSchemaVault
} from "@twin.org/vault-connector-entity-storage";
import { VaultConnectorFactory } from "@twin.org/vault-models";
import {
	EntityStorageFaucetConnector,
	EntityStorageWalletConnector,
	initSchema as initSchemaWallet,
	type WalletAddress
} from "@twin.org/wallet-connector-entity-storage";
import { FaucetConnectorFactory, WalletConnectorFactory } from "@twin.org/wallet-models";
import * as dotenv from "dotenv";

console.debug("Setting up test environment from .env and .env.dev files");

dotenv.config({ path: [path.join(__dirname, ".env"), path.join(__dirname, ".env.dev")] });

if (!Is.stringValue(process.env.TEST_MNEMONIC)) {
	// eslint-disable-next-line no-restricted-syntax
	throw new Error(
		`Please define TEST_MNEMONIC as a 24 word mnemonic either as an environment variable or inside an .env.dev file
		 e.g. TEST_MNEMONIC="word0 word1 ... word23"
		 You can generate one using the following command
		 npx "@twin.org/crypto-cli" mnemonic --env ./tests/.env.dev --env-prefix TEST_`
	);
}

export const TEST_IDENTITY_ID = "test-identity";
export const TEST_MNEMONIC_NAME = "test-mnemonic";

initSchemaVault();
initSchemaWallet();
initSchemaIdentity();
initSchemaNft();

EntityStorageConnectorFactory.register(
	"vault-key",
	() =>
		new MemoryEntityStorageConnector<VaultKey>({
			entitySchema: nameof<VaultKey>()
		})
);
const secretEntityStorage = new MemoryEntityStorageConnector<VaultSecret>({
	entitySchema: nameof<VaultSecret>()
});
EntityStorageConnectorFactory.register("vault-secret", () => secretEntityStorage);

const TEST_VAULT_CONNECTOR = new EntityStorageVaultConnector();
VaultConnectorFactory.register("vault", () => TEST_VAULT_CONNECTOR);

const walletAddressEntityStorage = new MemoryEntityStorageConnector<WalletAddress>({
	entitySchema: nameof<WalletAddress>()
});
EntityStorageConnectorFactory.register("wallet-address", () => walletAddressEntityStorage);

export const TEST_FAUCET_CONNECTOR = new EntityStorageFaucetConnector();
FaucetConnectorFactory.register("faucet", () => TEST_FAUCET_CONNECTOR);

export const TEST_WALLET_CONNECTOR = new EntityStorageWalletConnector({
	config: {
		vaultMnemonicId: TEST_MNEMONIC_NAME
	}
});
WalletConnectorFactory.register("wallet", () => TEST_WALLET_CONNECTOR);

const identityDocumentEntityStorage = new MemoryEntityStorageConnector<IdentityDocument>({
	entitySchema: nameof<IdentityDocument>()
});
EntityStorageConnectorFactory.register("identity-document", () => identityDocumentEntityStorage);

export const TEST_IDENTITY_CONNECTOR = new EntityStorageIdentityConnector();
IdentityConnectorFactory.register("identity", () => TEST_IDENTITY_CONNECTOR);

const nftEntityStorage = new MemoryEntityStorageConnector<Nft>({
	entitySchema: nameof<Nft>()
});
EntityStorageConnectorFactory.register("nft", () => nftEntityStorage);

export const TEST_NFT_CONNECTOR = new EntityStorageNftConnector();
NftConnectorFactory.register("nft", () => TEST_NFT_CONNECTOR);

await TEST_VAULT_CONNECTOR.setSecret(
	`${TEST_IDENTITY_ID}/${TEST_MNEMONIC_NAME}`,
	process.env.TEST_MNEMONIC
);

const addresses = await TEST_WALLET_CONNECTOR.getAddresses(TEST_IDENTITY_ID, 0, 0, 2);
export const TEST_IDENTITY_ADDRESS_BECH32 = addresses[0];
export const TEST_IDENTITY_ADDRESS_BECH32_2 = addresses[1];

/**
 * Setup the test environment.
 */
export async function setupTestEnv(): Promise<void> {
	await TEST_WALLET_CONNECTOR.ensureBalance(
		TEST_IDENTITY_ID,
		TEST_IDENTITY_ADDRESS_BECH32,
		1000000000n
	);
	await TEST_WALLET_CONNECTOR.ensureBalance(
		TEST_IDENTITY_ID,
		TEST_IDENTITY_ADDRESS_BECH32_2,
		1000000000n
	);
}
