// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { NftAttestationConnector, NftAttestationUtils } from "@twin.org/attestation-connector-nft";
import { CLIDisplay, CLIParam } from "@twin.org/cli-core";
import { Converter, I18n, Is, StringHelper } from "@twin.org/core";
import { setupIdentityConnector } from "@twin.org/identity-cli";
import { IdentityConnectorFactory } from "@twin.org/identity-models";
import { setupNftConnector } from "@twin.org/nft-cli";
import { IotaNftUtils } from "@twin.org/nft-connector-iota";
import { IotaStardustNftUtils } from "@twin.org/nft-connector-iota-stardust";
import { NftConnectorFactory } from "@twin.org/nft-models";
import { VaultConnectorFactory } from "@twin.org/vault-models";
import { setupWalletConnector } from "@twin.org/wallet-cli";
import { WalletConnectorFactory } from "@twin.org/wallet-models";
import { Command, Option } from "commander";
import { setupVault } from "./setupCommands";
import { AttestationConnectorTypes } from "../models/attestatationConnectorTypes";

/**
 * Build the attestation transfer command for the CLI.
 * @returns The command.
 */
export function buildCommandAttestationTransfer(): Command {
	const command = new Command();
	command
		.name("attestation-transfer")
		.summary(I18n.formatMessage("commands.attestation-transfer.summary"))
		.description(I18n.formatMessage("commands.attestation-transfer.description"))
		.requiredOption(
			I18n.formatMessage("commands.attestation-transfer.options.seed.param"),
			I18n.formatMessage("commands.attestation-transfer.options.seed.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-transfer.options.id.param"),
			I18n.formatMessage("commands.attestation-transfer.options.id.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-transfer.options.holder-address.param"),
			I18n.formatMessage("commands.attestation-transfer.options.holder-address.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-transfer.options.holder-identity.param"),
			I18n.formatMessage("commands.attestation-transfer.options.holder-identity.description")
		);

	command
		.addOption(
			new Option(
				I18n.formatMessage("commands.common.options.connector.param"),
				I18n.formatMessage("commands.common.options.connector.description")
			)
				.choices(Object.values(AttestationConnectorTypes))
				.default(AttestationConnectorTypes.Iota)
		)
		.option(
			I18n.formatMessage("commands.common.options.node.param"),
			I18n.formatMessage("commands.common.options.node.description"),
			"!NODE_URL"
		)
		.option(
			I18n.formatMessage("commands.common.options.network.param"),
			I18n.formatMessage("commands.common.options.network.description"),
			"!NETWORK"
		)
		.option(
			I18n.formatMessage("commands.common.options.explorer.param"),
			I18n.formatMessage("commands.common.options.explorer.description"),
			"!EXPLORER_URL"
		)
		.action(actionCommandAttestationTransfer);

	return command;
}

/**
 * Action the attestation transfer command.
 * @param opts The options for the command.
 * @param opts.seed The seed required for signing by the issuer.
 * @param opts.id The id of the attestation to transfer in urn format.
 * @param opts.holderIdentity The new holder identity of the attestation.
 * @param opts.holderAddress The new holder address of the attestation.
 * @param opts.connector The connector to perform the operations with.
 * @param opts.node The node URL.
 * @param opts.network The network to use for connector.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandAttestationTransfer(opts: {
	seed: string;
	id: string;
	holderIdentity: string;
	holderAddress: string;
	connector?: AttestationConnectorTypes;
	node: string;
	network?: string;
	explorer: string;
}): Promise<void> {
	const seed: Uint8Array = CLIParam.hexBase64("seed", opts.seed);
	const id: string = CLIParam.stringValue("id", opts.id);
	const holderIdentity: string = CLIParam.stringValue("holderIdentity", opts.holderIdentity);
	const holderAddress: string =
		opts.connector === AttestationConnectorTypes.Iota
			? Converter.bytesToHex(CLIParam.hex("holderAddress", opts.holderAddress), true)
			: CLIParam.bech32("holderAddress", opts.holderAddress);
	const network: string | undefined =
		opts.connector === AttestationConnectorTypes.Iota
			? CLIParam.stringValue("network", opts.network)
			: undefined;
	const nodeEndpoint: string = CLIParam.url("node", opts.node);
	const explorerEndpoint: string = CLIParam.url("explorer", opts.explorer);

	CLIDisplay.value(I18n.formatMessage("commands.attestation-transfer.labels.attestationId"), id);
	CLIDisplay.value(
		I18n.formatMessage("commands.attestation-transfer.labels.holderIdentity"),
		holderIdentity
	);
	CLIDisplay.value(
		I18n.formatMessage("commands.attestation-transfer.labels.holderAddress"),
		holderAddress
	);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.node"), nodeEndpoint);
	if (Is.stringValue(network)) {
		CLIDisplay.value(I18n.formatMessage("commands.common.labels.network"), network);
	}
	CLIDisplay.break();

	setupVault();

	const localIdentity = "identity";
	const vaultSeedId = "local-seed";

	const vaultConnector = VaultConnectorFactory.get("vault");
	await vaultConnector.setSecret(`${localIdentity}/${vaultSeedId}`, Converter.bytesToBase64(seed));

	const identityConnector = await setupIdentityConnector(
		{ nodeEndpoint, network, vaultSeedId },
		opts.connector
	);
	IdentityConnectorFactory.register("identity", () => identityConnector);

	const walletConnector = await setupWalletConnector(
		{ nodeEndpoint, network, vaultSeedId },
		opts.connector
	);
	WalletConnectorFactory.register("wallet", () => walletConnector);

	const nftConnector = await setupNftConnector(
		{ nodeEndpoint, network, vaultSeedId },
		opts.connector
	);
	NftConnectorFactory.register("nft", () => nftConnector);

	const attestationConnector = new NftAttestationConnector();

	CLIDisplay.task(
		I18n.formatMessage("commands.attestation-transfer.progress.transferringAttestation")
	);
	CLIDisplay.break();

	CLIDisplay.spinnerStart();

	await attestationConnector.transfer(localIdentity, id, holderIdentity, holderAddress);

	CLIDisplay.spinnerStop();

	const nftId = NftAttestationUtils.attestationIdToNftId(id);

	CLIDisplay.value(
		I18n.formatMessage("commands.common.labels.explore"),
		opts.connector === AttestationConnectorTypes.Iota
			? `${StringHelper.trimTrailingSlashes(explorerEndpoint)}/object/${IotaNftUtils.nftIdToObjectId(nftId)}?network=${network}`
			: `${StringHelper.trimTrailingSlashes(explorerEndpoint)}/addr/${IotaStardustNftUtils.nftIdToAddress(nftId)}`
	);
	CLIDisplay.break();

	CLIDisplay.done();
}
