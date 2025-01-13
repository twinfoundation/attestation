// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { NftAttestationConnector, NftAttestationUtils } from "@twin.org/attestation-connector-nft";
import {
	CLIDisplay,
	CLIOptions,
	CLIParam,
	CLIUtils,
	type CliOutputOptions
} from "@twin.org/cli-core";
import { I18n, Is, ObjectHelper, StringHelper } from "@twin.org/core";
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
export function buildCommandAttestationGet(): Command {
	const command = new Command();
	command
		.name("attestation-get")
		.summary(I18n.formatMessage("commands.attestation-get.summary"))
		.description(I18n.formatMessage("commands.attestation-get.description"))
		.requiredOption(
			I18n.formatMessage("commands.attestation-get.options.id.param"),
			I18n.formatMessage("commands.attestation-get.options.id.description")
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
		.action(actionCommandAttestationGet);

	return command;
}

/**
 * Action the attestation verify command.
 * @param opts The options for the command.
 * @param opts.id The id of the NFT to resolve in urn format.
 * @param opts.node The node URL.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandAttestationGet(
	opts: {
		id: string;
		node: string;
		explorer: string;
	} & CliOutputOptions
): Promise<void> {
	const id: string = CLIParam.stringValue("id", opts.id);
	const nodeEndpoint: string = CLIParam.url("node", opts.node);
	const explorerEndpoint: string = CLIParam.url("explorer", opts.explorer);

	CLIDisplay.value(I18n.formatMessage("commands.attestation-get.labels.attestationId"), id);
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

	const nftAttestationConnector = new NftAttestationConnector();

	CLIDisplay.task(I18n.formatMessage("commands.attestation-get.progress.gettingAttestation"));
	CLIDisplay.break();

	CLIDisplay.spinnerStart();

	const verificationResult = await nftAttestationConnector.get(id);

	CLIDisplay.spinnerStop();

	if (opts.console) {
		CLIDisplay.value(
			I18n.formatMessage("commands.attestation-get.labels.verified"),
			verificationResult.verified
		);
		CLIDisplay.break();

		if (Is.stringValue(verificationResult.verificationFailure)) {
			CLIDisplay.value(
				I18n.formatMessage("commands.attestation-get.labels.failure"),
				I18n.formatMessage(verificationResult.verificationFailure)
			);
			ObjectHelper.propertyDelete(verificationResult, "verificationFailure");
		}

		CLIDisplay.section(I18n.formatMessage("commands.attestation-get.labels.attestation"));

		CLIDisplay.json(verificationResult);
		CLIDisplay.break();
	}

	if (Is.stringValue(opts?.json)) {
		await CLIUtils.writeJsonFile(opts.json, verificationResult, opts.mergeJson);
	}

	if (Is.stringValue(verificationResult.id)) {
		const nftId = NftAttestationUtils.attestationIdToNftId(verificationResult.id);
		CLIDisplay.value(
			I18n.formatMessage("commands.common.labels.explore"),
			`${StringHelper.trimTrailingSlashes(explorerEndpoint)}/addr/${IotaNftUtils.nftIdToAddress(nftId)}`
		);
	}
	CLIDisplay.break();

	CLIDisplay.done();
}
