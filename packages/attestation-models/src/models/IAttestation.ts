// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRequestContext, IService } from "@gtsc/services";
import type { IAttestationProof } from "./IAttestationProof";

/**
 * Interface describing an attestation contract.
 */
export interface IAttestation extends IService {
	/**
	 * Sign the data and return the proof.
	 * @param requestContext The context for the request.
	 * @param keyId The key id from a vault to sign the data.
	 * @param data The data to store in blob storage and sign as base64.
	 * @param attestationNamespace The namespace of the attestation service to use. The service has a built in default if none is supplied.
	 * @returns The proof for the data with the id set as a unique identifier for the data.
	 */
	sign(
		requestContext: IRequestContext,
		keyId: string,
		data: string,
		attestationNamespace?: string
	): Promise<IAttestationProof>;

	/**
	 * Verify the a proof using the data in blob storage.
	 * @param requestContext The context for the request.
	 * @param proof The proof to verify against.
	 * @returns True if the verification is successful.
	 */
	verify(requestContext: IRequestContext, proof: IAttestationProof): Promise<boolean>;
}
