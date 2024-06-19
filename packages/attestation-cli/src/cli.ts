// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CLIBase } from "@gtsc/cli-core";
import { buildCommandAddress, buildCommandMnemonic } from "@gtsc/crypto-cli";
import {
	buildCommandIdentityCreate,
	buildCommandIdentityResolve,
	buildCommandVerifiableCredentialCreate,
	buildCommandVerifiableCredentialRevoke,
	buildCommandVerifiableCredentialUnrevoke,
	buildCommandVerifiableCredentialVerify,
	buildCommandVerificationMethodAdd,
	buildCommandVerificationMethodRemove
} from "@gtsc/identity-cli";
import { buildCommandFaucet } from "@gtsc/wallet-cli";
import type { Command } from "commander";
import { buildCommandAttestationAttest } from "./commands/attestationAttest";
import { buildCommandAttestationTransfer } from "./commands/attestationTransfer";
import { buildCommandAttestationVerify } from "./commands/attestationVerify";

/**
 * The main entry point for the CLI.
 */
export class CLI extends CLIBase {
	/**
	 * Run the app.
	 * @param argv The process arguments.
	 * @param localesDirectory The directory for the locales, default to relative to the script.
	 * @returns The exit code.
	 */
	public async run(argv: string[], localesDirectory?: string): Promise<number> {
		return this.execute(
			{
				title: "GTSC Attestation",
				appName: "gtsc-attestation",
				version: "0.0.3-next.8",
				icon: "🌍",
				supportsEnvFiles: true
			},
			localesDirectory ?? path.join(path.dirname(fileURLToPath(import.meta.url)), "../locales"),
			argv
		);
	}

	/**
	 * Get the commands for the CLI.
	 * @param program The main program to add the commands to.
	 * @internal
	 */
	protected getCommands(program: Command): Command[] {
		return [
			buildCommandMnemonic(),
			buildCommandAddress(),
			buildCommandFaucet(),
			buildCommandIdentityCreate(),
			buildCommandIdentityResolve(),
			buildCommandVerificationMethodAdd(),
			buildCommandVerificationMethodRemove(),
			buildCommandVerifiableCredentialCreate(),
			buildCommandVerifiableCredentialVerify(),
			buildCommandVerifiableCredentialRevoke(),
			buildCommandVerifiableCredentialUnrevoke(),
			buildCommandAttestationAttest(),
			buildCommandAttestationVerify(),
			buildCommandAttestationTransfer()
		];
	}
}
