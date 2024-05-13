// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRequestContext, IService } from "@gtsc/services";
import type { IDidProof } from "@gtsc/standards-w3c-did";

/**
 * Interface describing a attestation connector.
 */
export interface IAttestationConnector extends IService {
	/**
	 * Sign the data and return the proof.
	 * @param requestContext The context for the request.
	 * @param data The data to sign.
	 * @returns The proof for the data with the id set as a unique identifier for the data.
	 */
	sign(requestContext: IRequestContext, data: unknown): Promise<IDidProof>;

	/**
	 * Verify the data against the proof the proof.
	 * @param requestContext The context for the request.
	 * @param data The data to verify.
	 * @param proof The proof to verify against.
	 * @returns True if the verification is successful.
	 */
	verify(requestContext: IRequestContext, data: unknown, proof: IDidProof): Promise<boolean>;
}
