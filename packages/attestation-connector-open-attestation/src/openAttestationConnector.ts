// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector, IAttestationInformation } from "@twin.org/attestation-models";
import { NotImplementedError } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { nameof } from "@twin.org/nameof";
import type { IOpenAttestationConnectorConstructorOptions } from "./models/IOpenAttestationConnectorConstructorOptions";

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
	 * @param options The options for the attestation connector.
	 */
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(options: IOpenAttestationConnectorConstructorOptions) {}

	/**
	 * Attest the data and return the collated information.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param address The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param attestationObject The data to attest.
	 * @returns The id.
	 */
	public async create(
		controller: string,
		address: string,
		verificationMethodId: string,
		attestationObject: IJsonLdNodeObject
	): Promise<string> {
		throw new NotImplementedError(this.CLASS_NAME, "attest");
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async get(id: string): Promise<IAttestationInformation> {
		throw new NotImplementedError(this.CLASS_NAME, "verify");
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The holder identity of the attestation.
	 * @param holderAddress The new controller address of the attestation belonging to the holder.
	 * @returns Nothing.
	 */
	public async transfer(
		controller: string,
		attestationId: string,
		holderIdentity: string,
		holderAddress: string
	): Promise<void> {
		throw new NotImplementedError(this.CLASS_NAME, "transfer");
	}

	/**
	 * Destroy the attestation.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to destroy.
	 * @returns Nothing.
	 */
	public async destroy(controller: string, attestationId: string): Promise<void> {
		throw new NotImplementedError(this.CLASS_NAME, "destroy");
	}
}
