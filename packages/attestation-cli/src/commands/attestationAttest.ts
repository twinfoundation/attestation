// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { IotaAttestationConnector, IotaAttestationUtils } from "@gtsc/attestation-connector-iota";
import { CLIDisplay, CLIOptions, CLIParam, CLIUtils, type CliOutputOptions } from "@gtsc/cli-core";
import { Converter, I18n, Is, StringHelper } from "@gtsc/core";
import { IotaIdentityConnector } from "@gtsc/identity-connector-iota";
import { IdentityConnectorFactory } from "@gtsc/identity-models";
import { IotaNftConnector, IotaNftUtils } from "@gtsc/nft-connector-iota";
import { NftConnectorFactory } from "@gtsc/nft-models";
import { VaultConnectorFactory, VaultKeyType } from "@gtsc/vault-models";
import { Command } from "commander";
import { setupVault } from "./setupCommands";

/**
 * Build the attestation attest command for the CLI.
 * @returns The command.
 */
export function buildCommandAttestationAttest(): Command {
	const command = new Command();
	command
		.name("attestation-attest")
		.summary(I18n.formatMessage("commands.attestation-attest.summary"))
		.description(I18n.formatMessage("commands.attestation-attest.description"))
		.requiredOption(
			I18n.formatMessage("commands.attestation-attest.options.seed.param"),
			I18n.formatMessage("commands.attestation-attest.options.seed.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-attest.options.owner.param"),
			I18n.formatMessage("commands.attestation-attest.options.owner.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-attest.options.verification-method-id.param"),
			I18n.formatMessage("commands.attestation-attest.options.verification-method-id.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-attest.options.private-key.param"),
			I18n.formatMessage("commands.attestation-attest.options.private-key.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-attest.options.data-json.param"),
			I18n.formatMessage("commands.attestation-attest.options.data-json.description")
		);

	CLIOptions.output(command, {
		noConsole: true,
		json: true,
		env: true,
		mergeJson: true,
		mergeEnv: true
	});

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
		.action(actionCommandAttestationAttest);

	return command;
}

/**
 * Action the attestation attest command.
 * @param opts The options for the command.
 * @param opts.seed The seed required for funding the owner address.
 * @param opts.owner The owner address of the attestation.
 * @param opts.verificationMethodId The id of the verification method to use for the credential.
 * @param opts.privateKey The private key for the verification method.
 * @param opts.dataJson Filename of the JSON data.
 * @param opts.node The node URL.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandAttestationAttest(
	opts: {
		seed: string;
		owner: string;
		verificationMethodId: string;
		privateKey: string;
		dataJson: string;
		node: string;
		explorer: string;
	} & CliOutputOptions
): Promise<void> {
	const seed: Uint8Array = CLIParam.hexBase64("seed", opts.seed);
	const owner: string = CLIParam.bech32("owner", opts.owner);
	const verificationMethodId: string = CLIParam.stringValue(
		"verificationMethodId",
		opts.verificationMethodId
	);
	const privateKey: Uint8Array = CLIParam.hexBase64("private-key", opts.privateKey);
	const dataJsonFilename: string = path.resolve(opts.dataJson);
	const nodeEndpoint: string = CLIParam.url("node", opts.node);
	const explorerEndpoint: string = CLIParam.url("explorer", opts.explorer);

	CLIDisplay.value(
		I18n.formatMessage("commands.attestation-attest.labels.verificationMethodId"),
		verificationMethodId
	);
	CLIDisplay.value(I18n.formatMessage("commands.attestation-attest.labels.owner"), owner);
	CLIDisplay.value(
		I18n.formatMessage("commands.attestation-attest.labels.dataJsonFilename"),
		dataJsonFilename
	);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.node"), nodeEndpoint);
	CLIDisplay.break();

	setupVault();

	const requestContext = { identity: "local", tenantId: "local" };
	const vaultSeedId = "local-seed";

	const vaultConnector = VaultConnectorFactory.get("vault");
	await vaultConnector.setSecret(requestContext, vaultSeedId, Converter.bytesToBase64(seed));
	await vaultConnector.addKey(
		requestContext,
		verificationMethodId,
		VaultKeyType.Ed25519,
		privateKey,
		new Uint8Array()
	);

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

	const dataJson = await CLIUtils.readJsonFile(dataJsonFilename);

	if (Is.object(dataJson)) {
		CLIDisplay.section(I18n.formatMessage("commands.attestation-attest.labels.dataJson"));
		CLIDisplay.json(dataJson);
		CLIDisplay.break();
	}

	CLIDisplay.task(I18n.formatMessage("commands.attestation-attest.progress.attestingData"));
	CLIDisplay.break();

	CLIDisplay.spinnerStart();

	const attestationInformation = await iotaAttestationConnector.attest(
		requestContext,
		owner,
		verificationMethodId,
		dataJson
	);

	const attestationId = attestationInformation.id;
	const nftId = IotaAttestationUtils.attestationIdToNftId(attestationId);

	CLIDisplay.spinnerStop();

	if (opts.console) {
		CLIDisplay.value(
			I18n.formatMessage("commands.attestation-attest.labels.attestationId"),
			attestationId
		);
		CLIDisplay.value(I18n.formatMessage("commands.attestation-attest.labels.nftId"), nftId);
		CLIDisplay.break();
	}

	if (Is.stringValue(opts?.json)) {
		await CLIUtils.writeJsonFile(opts.json, { attestationId }, opts.mergeJson);
	}
	if (Is.stringValue(opts?.env)) {
		await CLIUtils.writeEnvFile(opts.env, [`ATTESTATION_ID="${attestationId}"`], opts.mergeEnv);
	}

	CLIDisplay.value(
		I18n.formatMessage("commands.common.labels.explore"),
		`${StringHelper.trimTrailingSlashes(explorerEndpoint)}/addr/${IotaNftUtils.nftIdToAddress(nftId)}`
	);
	CLIDisplay.break();

	CLIDisplay.done();
}
