// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import type { IAttestationProof } from "./IAttestationProof";

/**
 * Interface describing the collated attestation information.
 */
export interface IAttestationInformation<T = unknown> {
	/**
	 * The unique identifier of the attestation.
	 */
	id: string;

	/**
	 * Created date/time of the attestation in ISO format.
	 */
	created: string;

	/**
	 * The identity of the owner.
	 */
	ownerIdentity: string;

	/**
	 * Transferred date/time of the attestation in ISO format, can be blank if holder identity is owner.
	 */
	transferred?: string;

	/**
	 * The identity of the current holder, can be undefined if owner is still the holder.
	 */
	holderIdentity?: string;

	/**
	 * The data that was attested.
	 */
	data: T;

	/**
	 * The proof for the attested data.
	 */
	proof: IAttestationProof;
}
