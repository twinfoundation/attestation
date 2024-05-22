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
	 * The namespace for the entities.
	 */
	public static readonly NAMESPACE: string = "entity-attestation";

	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<EntityStorageAttestationConnector>();

	/**
	 * Create a new instance of EntityStorageAttestationConnector.
	 * @param dependencies The dependencies for the attestation connector.
	 * @param dependencies.a The dependency for the attestation connector.
	 * @param config The configuration for the attestation connector.
	 */
	constructor(dependencies: { a: string }, config?: IEntityStorageAttestationConnectorConfig) {
		Guards.object(
			EntityStorageAttestationConnector._CLASS_NAME,
			nameof(dependencies),
			dependencies
		);
	}

	/**
	 * Sign the data and return the proof.
	 * @param requestContext The context for the request.
	 * @param keyId The key id from a vault to sign the data.
	 * @param data The data to sign.
	 * @returns The proof for the data with the id set as a unique identifier for the data.
	 */
	public async sign(
		requestContext: IRequestContext,
		keyId: string,
		data: unknown
	): Promise<IDidProof> {
		return {
			type: "foo",
			proofPurpose: "assertionMethod"
		};
	}

	/**
	 * Verify the data against the proof.
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
