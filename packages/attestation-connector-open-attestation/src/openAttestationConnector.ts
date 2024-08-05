// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector, IAttestationInformation } from "@gtsc/attestation-models";
import { NotImplementedError } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IOpenAttestationConnectorConfig } from "./models/IOpenAttestationConnectorConfig";

/**
 * Class for performing attestation operations in entity storage.
 */
export class OpenAttestationConnector implements IAttestationConnector {
	/**
	 * The namespace for the entities.
	 */
	public static readonly NAMESPACE: string = "open-attestation";

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<OpenAttestationConnector>();

	/**
	 * Create a new instance of OpenAttestationConnector.
	 * @param config The configuration for the attestation connector.
	 */
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(config?: IOpenAttestationConnectorConfig) {}

	/**
	 * Attest the data and return the collated information.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param address The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @returns The collated attestation data.
	 */
	public async attest<T = unknown>(
		controller: string,
		address: string,
		verificationMethodId: string,
		data: T
	): Promise<IAttestationInformation<T>> {
		throw new NotImplementedError(this.CLASS_NAME, "attest");
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param attestationId The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async verify<T = unknown>(
		attestationId: string
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}> {
		throw new NotImplementedError(this.CLASS_NAME, "verify");
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The holder identity of the attestation.
	 * @param holderAddress The new controller address of the attestation belonging to the holder.
	 * @returns The updated attestation details.
	 */
	public async transfer<T = unknown>(
		controller: string,
		attestationId: string,
		holderIdentity: string,
		holderAddress: string
	): Promise<IAttestationInformation<T>> {
		throw new NotImplementedError(this.CLASS_NAME, "transfer");
	}
}
