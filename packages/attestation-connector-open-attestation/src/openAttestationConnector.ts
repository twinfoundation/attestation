// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector } from "@gtsc/attestation-models";
import { nameof } from "@gtsc/nameof";
import type { IRequestContext } from "@gtsc/services";
import type { IDidProof } from "@gtsc/standards-w3c-did";
import type { IOpenAttestationConnectorConfig } from "./models/IOpenAttestationConnectorConfig";

/**
 * Class for performing attestation operations in entity storage.
 */
export class OpenAttestationConnector implements IAttestationConnector {
	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<OpenAttestationConnector>();

	/**
	 * The namespace for the entities.
	 * @internal
	 */
	private static readonly _NAMESPACE: string = "open-attestation";

	/**
	 * Create a new instance of EntityStorageAttestationConnector.
	 * @param config The configuration for the attestation connector.
	 */
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(config?: IOpenAttestationConnectorConfig) {}

	/**
	 * Sign the data and return the proof.
	 * @param requestContext The context for the request.
	 * @param data The data to sign.
	 * @returns The proof for the data with the id set as a unique identifier for the data.
	 */
	public async sign(requestContext: IRequestContext, data: unknown): Promise<IDidProof> {
		return {
			type: "foo",
			proofPurpose: "assertionMethod"
		};
	}

	/**
	 * Verify the data against the proof the proof.
	 * @param requestContext The context for the request.
	 * @param data The data to verify.
	 * @param proof The proof to verify against.
	 * @returns True if the verification is successful.
	 */
	public async verify(
		requestContext: IRequestContext,
		data: unknown,
		proof: IDidProof
	): Promise<boolean> {
		return false;
	}
}
