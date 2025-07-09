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
import { setupIdentityConnector } from "@twin.org/identity-cli";
import { IdentityConnectorFactory } from "@twin.org/identity-models";
import { setupNftConnector } from "@twin.org/nft-cli";
import { IotaNftUtils } from "@twin.org/nft-connector-iota";
import { NftConnectorFactory } from "@twin.org/nft-models";
import { setupWalletConnector } from "@twin.org/wallet-cli";
import { WalletConnectorFactory } from "@twin.org/wallet-models";
import { Command, Option } from "commander";
import { setupVault } from "./setupCommands";
import { AttestationConnectorTypes } from "../models/attestatationConnectorTypes";

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
		.action(actionCommandAttestationGet);

	return command;
}

/**
 * Action the attestation verify command.
 * @param opts The options for the command.
 * @param opts.id The id of the NFT to resolve in urn format.
 * @param opts.connector The connector to perform the operations with.
 * @param opts.node The node URL.
 * @param opts.network The network to use for connector.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandAttestationGet(
	opts: {
		id: string;
		connector?: AttestationConnectorTypes;
		node: string;
		network?: string;
		explorer: string;
	} & CliOutputOptions
): Promise<void> {
	const id: string = CLIParam.stringValue("id", opts.id);
	const nodeEndpoint: string = CLIParam.url("node", opts.node);
	const network: string | undefined =
		opts.connector === AttestationConnectorTypes.Iota
			? CLIParam.stringValue("network", opts.network)
			: undefined;
	const explorerEndpoint: string = CLIParam.url("explorer", opts.explorer);

	CLIDisplay.value(I18n.formatMessage("commands.attestation-get.labels.attestationId"), id);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.node"), nodeEndpoint);
	if (Is.stringValue(network)) {
		CLIDisplay.value(I18n.formatMessage("commands.common.labels.network"), network);
	}
	CLIDisplay.break();

	setupVault();

	const identityConnector = await setupIdentityConnector({ nodeEndpoint, network }, opts.connector);
	IdentityConnectorFactory.register("identity", () => identityConnector);

	const walletConnector = await setupWalletConnector({ nodeEndpoint, network }, opts.connector);
	WalletConnectorFactory.register("wallet", () => walletConnector);

	const nftConnector = await setupNftConnector({ nodeEndpoint, network }, opts.connector);
	NftConnectorFactory.register("nft", () => nftConnector);

	const attestationConnector = new NftAttestationConnector();

	CLIDisplay.task(I18n.formatMessage("commands.attestation-get.progress.gettingAttestation"));
	CLIDisplay.break();

	CLIDisplay.spinnerStart();

	const verificationResult = await attestationConnector.get(id);

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
			`${StringHelper.trimTrailingSlashes(explorerEndpoint)}/object/${IotaNftUtils.nftIdToObjectId(nftId)}?network=${network}`
		);
	}
	CLIDisplay.break();

	CLIDisplay.done();
}
