// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestation, IAttestationConnector } from "@gtsc/attestation-models";
import { Guards } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IRequestContext } from "@gtsc/services";
import type { IDidProof } from "@gtsc/standards-w3c-did";

/**
 * Service for performing attestation operations to a connector.
 */
export class AttestationService implements IAttestation {
	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<AttestationService>();

	/**
	 * Attestation connector used by the service.
	 * @internal
	 */
	private readonly _attestationConnector: IAttestationConnector;

	/**
	 * Create a new instance of AttestationService.
	 * @param dependencies The connectors to use.
	 * @param dependencies.attestationConnector The attestation connector.
	 */
	constructor(dependencies: { attestationConnector: IAttestationConnector }) {
		Guards.object(AttestationService._CLASS_NAME, nameof(dependencies), dependencies);
		Guards.object(
			AttestationService._CLASS_NAME,
			nameof(dependencies.attestationConnector),
			dependencies.attestationConnector
		);
		this._attestationConnector = dependencies.attestationConnector;
	}

	/**
	 * Sign the data and return the proof.
	 * @param requestContext The context for the request.
	 * @param data The data to sign.
	 * @returns The proof for the data with the id set as a unique identifier for the data.
	 */
	public async sign(requestContext: IRequestContext, data: unknown): Promise<IDidProof> {
		Guards.object(AttestationService._CLASS_NAME, nameof(requestContext), requestContext);
		Guards.stringValue(
			AttestationService._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.object(AttestationService._CLASS_NAME, nameof(data), data);
		return this._attestationConnector.sign(requestContext, data);
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
		Guards.object(AttestationService._CLASS_NAME, nameof(requestContext), requestContext);
		Guards.stringValue(
			AttestationService._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.object(AttestationService._CLASS_NAME, nameof(data), data);
		Guards.object(AttestationService._CLASS_NAME, nameof(proof), proof);
		return this._attestationConnector.verify(requestContext, data, proof);
	}
}
