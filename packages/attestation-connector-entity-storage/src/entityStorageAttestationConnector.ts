// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector } from "@gtsc/attestation-models";
import { Guards } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IRequestContext } from "@gtsc/services";
import type { IDidProof } from "@gtsc/standards-w3c-did";
import type { IEntityStorageAttestationConnectorConfig } from "./models/IEntityStorageAttestationConnectorConfig";

/**
 * Class for performing attestation operations in entity storage.
 */
export class EntityStorageAttestationConnector implements IAttestationConnector {
	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<EntityStorageAttestationConnector>();

	/**
	 * The namespace for the entities.
	 * @internal
	 */
	private static readonly _NAMESPACE: string = "entity-attestation";

	/**
	 * Create a new instance of EntityStorageAttestationConnector.
	 * @param dependencies The dependencies for the attestation connector.
	 * @param config The configuration for the attestation connector.
	 */
	// eslint-disable-next-line @typescript-eslint/ban-types
	constructor(dependencies: {}, config?: IEntityStorageAttestationConnectorConfig) {
		Guards.object(
			EntityStorageAttestationConnector._CLASS_NAME,
			nameof(dependencies),
			dependencies
		);
	}

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
