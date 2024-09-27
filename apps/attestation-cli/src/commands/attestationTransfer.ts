// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	IotaAttestationConnector,
	IotaAttestationUtils
} from "@twin.org/attestation-connector-iota";
import { CLIDisplay, CLIParam } from "@twin.org/cli-core";
import { Converter, I18n, StringHelper } from "@twin.org/core";
import { IotaIdentityConnector } from "@twin.org/identity-connector-iota";
import { IdentityConnectorFactory } from "@twin.org/identity-models";
import { IotaNftConnector, IotaNftUtils } from "@twin.org/nft-connector-iota";
import { NftConnectorFactory } from "@twin.org/nft-models";
import { VaultConnectorFactory } from "@twin.org/vault-models";
import { Command } from "commander";
import { setupVault } from "./setupCommands";

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
		.option(
			I18n.formatMessage("commands.common.options.node.param"),
			I18n.formatMessage("commands.common.options.node.description"),
			"!NODE_URL"
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
 * @param opts.node The node URL.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandAttestationTransfer(opts: {
	seed: string;
	id: string;
	holderIdentity: string;
	holderAddress: string;
	node: string;
	explorer: string;
}): Promise<void> {
	const seed: Uint8Array = CLIParam.hexBase64("seed", opts.seed);
	const id: string = CLIParam.stringValue("id", opts.id);
	const holderIdentity: string = CLIParam.stringValue("recipient", opts.holderIdentity);
	const holderAddress: string = CLIParam.bech32("recipient", opts.holderAddress);
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
	CLIDisplay.break();

	setupVault();

	const localIdentity = "identity";
	const vaultSeedId = "local-seed";

	const vaultConnector = VaultConnectorFactory.get("vault");
	await vaultConnector.setSecret(`${localIdentity}/${vaultSeedId}`, Converter.bytesToBase64(seed));

	IdentityConnectorFactory.register(
		"identity",
		() =>
			new IotaIdentityConnector({
				config: {
					clientOptions: {
						nodes: [nodeEndpoint],
						localPow: true
					}
				}
			})
	);

	NftConnectorFactory.register(
		"nft",
		() =>
			new IotaNftConnector({
				config: {
					clientOptions: {
						nodes: [nodeEndpoint],
						localPow: true
					},
					vaultSeedId
				}
			})
	);

	const iotaAttestationConnector = new IotaAttestationConnector();

	CLIDisplay.task(
		I18n.formatMessage("commands.attestation-transfer.progress.transferringAttestation")
	);
	CLIDisplay.break();

	CLIDisplay.spinnerStart();

	await iotaAttestationConnector.transfer(
		localIdentity,
		id,
		holderIdentity,
		holderAddress
	);

	CLIDisplay.spinnerStop();

	const nftId = IotaAttestationUtils.attestationIdToNftId(id);

	CLIDisplay.value(
		I18n.formatMessage("commands.common.labels.explore"),
		`${StringHelper.trimTrailingSlashes(explorerEndpoint)}/addr/${IotaNftUtils.nftIdToAddress(nftId)}`
	);
	CLIDisplay.break();

	CLIDisplay.done();
}
