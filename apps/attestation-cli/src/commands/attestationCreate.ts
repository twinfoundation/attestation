// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { NftAttestationConnector, NftAttestationUtils } from "@twin.org/attestation-connector-nft";
import {
	CLIDisplay,
	CLIOptions,
	CLIParam,
	CLIUtils,
	type CliOutputOptions
} from "@twin.org/cli-core";
import { Converter, GeneralError, I18n, Is, StringHelper } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { setupIdentityConnector } from "@twin.org/identity-cli";
import { DocumentHelper, IdentityConnectorFactory } from "@twin.org/identity-models";
import { setupNftConnector } from "@twin.org/nft-cli";
import { IotaNftUtils } from "@twin.org/nft-connector-iota";
import { NftConnectorFactory } from "@twin.org/nft-models";
import { VaultConnectorFactory, VaultKeyType } from "@twin.org/vault-models";
import { setupWalletConnector } from "@twin.org/wallet-cli";
import { WalletConnectorFactory } from "@twin.org/wallet-models";
import { Command, Option } from "commander";
import { setupVault } from "./setupCommands";
import { AttestationConnectorTypes } from "../models/attestatationConnectorTypes";

/**
 * Build the attestation attest command for the CLI.
 * @returns The command.
 */
export function buildCommandAttestationCreate(): Command {
	const command = new Command();
	command
		.name("attestation-create")
		.summary(I18n.formatMessage("commands.attestation-create.summary"))
		.description(I18n.formatMessage("commands.attestation-create.description"))
		.requiredOption(
			I18n.formatMessage("commands.attestation-create.options.seed.param"),
			I18n.formatMessage("commands.attestation-create.options.seed.description")
		)
		.option(
			I18n.formatMessage("commands.attestation-create.options.wallet-address-index.param"),
			I18n.formatMessage("commands.attestation-create.options.wallet-address-index.description"),
			"0"
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-create.options.verification-method-id.param"),
			I18n.formatMessage("commands.attestation-create.options.verification-method-id.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-create.options.private-key.param"),
			I18n.formatMessage("commands.attestation-create.options.private-key.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-create.options.data-json.param"),
			I18n.formatMessage("commands.attestation-create.options.data-json.description")
		);

	CLIOptions.output(command, {
		noConsole: true,
		json: true,
		env: true,
		mergeJson: true,
		mergeEnv: true
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
		.action(actionCommandAttestationCreate);

	return command;
}

/**
 * Action the attestation attest command.
 * @param opts The options for the command.
 * @param opts.seed The seed required for funding the owner address.
 * @param opts.walletAddressIndex The wallet address index.
 * @param opts.verificationMethodId The id of the verification method to use for the credential.
 * @param opts.privateKey The private key for the verification method.
 * @param opts.dataJson Filename of the JSON data.
 * @param opts.connector The connector to perform the operations with.
 * @param opts.node The node URL.
 * @param opts.network The network to use for connector.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandAttestationCreate(
	opts: {
		seed: string;
		walletAddressIndex?: string;
		verificationMethodId: string;
		privateKey: string;
		dataJson: string;
		connector?: AttestationConnectorTypes;
		node: string;
		network?: string;
		explorer: string;
	} & CliOutputOptions
): Promise<void> {
	const seed: Uint8Array = CLIParam.hexBase64("seed", opts.seed);
	const walletAddressIndex = Is.empty(opts.walletAddressIndex)
		? undefined
		: CLIParam.integer("wallet-address-index", opts.walletAddressIndex);
	const verificationMethodId: string = CLIParam.stringValue(
		"verificationMethodId",
		opts.verificationMethodId
	);
	const privateKey: Uint8Array = CLIParam.hexBase64("private-key", opts.privateKey);
	const dataJsonFilename: string = path.resolve(opts.dataJson);
	const network: string | undefined =
		opts.connector === AttestationConnectorTypes.Iota
			? CLIParam.stringValue("network", opts.network)
			: undefined;
	const nodeEndpoint: string = CLIParam.url("node", opts.node);
	const explorerEndpoint: string = CLIParam.url("explorer", opts.explorer);

	if (Is.integer(walletAddressIndex)) {
		CLIDisplay.value(
			I18n.formatMessage("commands.nft-mint.labels.walletAddressIndex"),
			walletAddressIndex
		);
	}
	CLIDisplay.value(
		I18n.formatMessage("commands.attestation-create.labels.verificationMethodId"),
		verificationMethodId
	);
	CLIDisplay.value(
		I18n.formatMessage("commands.attestation-create.labels.dataJsonFilename"),
		dataJsonFilename
	);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.node"), nodeEndpoint);
	if (Is.stringValue(network)) {
		CLIDisplay.value(I18n.formatMessage("commands.common.labels.network"), network);
	}
	CLIDisplay.break();

	setupVault();

	const localIdentity = "identity";
	const vaultSeedId = "local-seed";

	const vmParts = DocumentHelper.parseId(verificationMethodId);

	const vaultConnector = VaultConnectorFactory.get("vault");
	await vaultConnector.setSecret(`${localIdentity}/${vaultSeedId}`, Converter.bytesToBase64(seed));
	await vaultConnector.addKey(
		`${localIdentity}/${vmParts.fragment}`,
		VaultKeyType.Ed25519,
		privateKey,
		new Uint8Array()
	);

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
		{ nodeEndpoint, network, vaultSeedId, walletAddressIndex },
		opts.connector
	);
	NftConnectorFactory.register("nft", () => nftConnector);

	const attestationConnector = new NftAttestationConnector();

	const dataJson = await CLIUtils.readJsonFile<IJsonLdNodeObject>(dataJsonFilename);

	if (!Is.object(dataJson)) {
		throw new GeneralError("attestation-cli", "invalidJson");
	} else {
		CLIDisplay.section(I18n.formatMessage("commands.attestation-create.labels.dataJson"));
		CLIDisplay.json(dataJson);
		CLIDisplay.break();
	}

	CLIDisplay.task(I18n.formatMessage("commands.attestation-create.progress.attestingData"));
	CLIDisplay.break();

	CLIDisplay.spinnerStart();

	const attestationId = await attestationConnector.create(
		localIdentity,
		verificationMethodId,
		dataJson
	);

	const nftId = NftAttestationUtils.attestationIdToNftId(attestationId);

	CLIDisplay.spinnerStop();

	if (opts.console) {
		CLIDisplay.value(
			I18n.formatMessage("commands.attestation-create.labels.attestationId"),
			attestationId
		);
		CLIDisplay.value(I18n.formatMessage("commands.attestation-create.labels.nftId"), nftId);
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
		`${StringHelper.trimTrailingSlashes(explorerEndpoint)}/object/${IotaNftUtils.nftIdToObjectId(nftId)}?network=${network}`
	);
	CLIDisplay.break();

	CLIDisplay.done();
}
