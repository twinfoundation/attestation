// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	IotaAttestationConnector,
	IotaAttestationUtils
} from "@twin.org/attestation-connector-iota";
import {
	CLIDisplay,
	CLIOptions,
	CLIParam,
	CLIUtils,
	type CliOutputOptions
} from "@twin.org/cli-core";
import { I18n, Is, StringHelper } from "@twin.org/core";
import { IotaIdentityConnector } from "@twin.org/identity-connector-iota";
import { IdentityConnectorFactory } from "@twin.org/identity-models";
import { IotaNftConnector, IotaNftUtils } from "@twin.org/nft-connector-iota";
import { NftConnectorFactory } from "@twin.org/nft-models";
import { Command } from "commander";
import { setupVault } from "./setupCommands";

/**
 * Build the attestation resolve command for the CLI.
 * @returns The command.
 */
export function buildCommandAttestationVerify(): Command {
	const command = new Command();
	command
		.name("attestation-verify")
		.summary(I18n.formatMessage("commands.attestation-verify.summary"))
		.description(I18n.formatMessage("commands.attestation-verify.description"))
		.requiredOption(
			I18n.formatMessage("commands.attestation-verify.options.id.param"),
			I18n.formatMessage("commands.attestation-verify.options.id.description")
		);

	CLIOptions.output(command, {
		noConsole: true,
		json: true,
		env: false,
		mergeJson: true,
		mergeEnv: false
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
		.action(actionCommandAttestationVerify);

	return command;
}

/**
 * Action the attestation verify command.
 * @param opts The options for the command.
 * @param opts.id The id of the NFT to resolve in urn format.
 * @param opts.node The node URL.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandAttestationVerify(
	opts: {
		id: string;
		node: string;
		explorer: string;
	} & CliOutputOptions
): Promise<void> {
	const id: string = CLIParam.stringValue("id", opts.id);
	const nodeEndpoint: string = CLIParam.url("node", opts.node);
	const explorerEndpoint: string = CLIParam.url("explorer", opts.explorer);

	CLIDisplay.value(I18n.formatMessage("commands.attestation-verify.labels.attestationId"), id);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.node"), nodeEndpoint);
	CLIDisplay.break();

	setupVault();

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
					}
				}
			})
	);

	const iotaAttestationConnector = new IotaAttestationConnector();

	CLIDisplay.task(I18n.formatMessage("commands.attestation-verify.progress.verifyingAttestation"));
	CLIDisplay.break();

	CLIDisplay.spinnerStart();

	const verificationResult = await iotaAttestationConnector.verify(id);

	CLIDisplay.spinnerStop();

	if (opts.console) {
		CLIDisplay.value(
			I18n.formatMessage("commands.attestation-verify.labels.verified"),
			verificationResult.verified
		);
		CLIDisplay.break();

		if (Is.stringValue(verificationResult.failure)) {
			CLIDisplay.value(
				I18n.formatMessage("commands.attestation-verify.labels.failure"),
				I18n.formatMessage(verificationResult.failure)
			);
		}

		CLIDisplay.section(I18n.formatMessage("commands.attestation-verify.labels.attestation"));

		if (!Is.undefined(verificationResult.information)) {
			CLIDisplay.json(verificationResult.information);
		}
		CLIDisplay.break();
	}

	if (Is.stringValue(opts?.json)) {
		await CLIUtils.writeJsonFile(opts.json, verificationResult, opts.mergeJson);
	}

	if (Is.stringValue(verificationResult.information?.id)) {
		const nftId = IotaAttestationUtils.attestationIdToNftId(verificationResult.information.id);
		CLIDisplay.value(
			I18n.formatMessage("commands.common.labels.explore"),
			`${StringHelper.trimTrailingSlashes(explorerEndpoint)}/addr/${IotaNftUtils.nftIdToAddress(nftId)}`
		);
	}
	CLIDisplay.break();

	CLIDisplay.done();
}
