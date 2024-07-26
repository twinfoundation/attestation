// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { IotaAttestationConnector, IotaAttestationUtils } from "@gtsc/attestation-connector-iota";
import { CLIDisplay, CLIParam } from "@gtsc/cli-core";
import { Converter, I18n, StringHelper } from "@gtsc/core";
import { IotaIdentityConnector } from "@gtsc/identity-connector-iota";
import { IdentityConnectorFactory } from "@gtsc/identity-models";
import { IotaNftConnector, IotaNftUtils } from "@gtsc/nft-connector-iota";
import { NftConnectorFactory } from "@gtsc/nft-models";
import { VaultConnectorFactory } from "@gtsc/vault-models";
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
 * @param opts.holderAddress The new holder address of the attestation.
 * @param opts.holderIdentity The new holder identity of the attestation.
 * @param opts.node The node URL.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandAttestationTransfer(opts: {
	seed: string;
	id: string;
	holderAddress: string;
	holderIdentity: string;
	node: string;
	explorer: string;
}): Promise<void> {
	const seed: Uint8Array = CLIParam.hexBase64("seed", opts.seed);
	const id: string = CLIParam.stringValue("id", opts.id);
	const holderAddress: string = CLIParam.bech32("recipient", opts.holderAddress);
	const holderIdentity: string = CLIParam.stringValue("recipient", opts.holderIdentity);
	const nodeEndpoint: string = CLIParam.url("node", opts.node);
	const explorerEndpoint: string = CLIParam.url("explorer", opts.explorer);

	CLIDisplay.value(I18n.formatMessage("commands.attestation-transfer.labels.attestationId"), id);
	CLIDisplay.value(
		I18n.formatMessage("commands.attestation-transfer.labels.holderAddress"),
		holderAddress
	);
	CLIDisplay.value(
		I18n.formatMessage("commands.attestation-transfer.labels.holderIdentity"),
		holderIdentity
	);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.node"), nodeEndpoint);
	CLIDisplay.break();

	setupVault();

	const requestContext = { userIdentity: "local", partitionId: "local" };
	const vaultSeedId = "local-seed";

	const vaultConnector = VaultConnectorFactory.get("vault");
	await vaultConnector.setSecret(vaultSeedId, Converter.bytesToBase64(seed), requestContext);

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

	const attestationInformation = await iotaAttestationConnector.transfer(
		id,
		holderAddress,
		holderIdentity,
		requestContext
	);

	CLIDisplay.spinnerStop();

	const attestationId = attestationInformation.id;
	const nftId = IotaAttestationUtils.attestationIdToNftId(attestationId);

	CLIDisplay.value(
		I18n.formatMessage("commands.common.labels.explore"),
		`${StringHelper.trimTrailingSlashes(explorerEndpoint)}/addr/${IotaNftUtils.nftIdToAddress(nftId)}`
	);
	CLIDisplay.break();

	CLIDisplay.done();
}
