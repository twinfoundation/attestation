// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HeaderTypes, MimeTypes } from "@twin.org/web";

/**
 * Verify that the proof is valid for the attestation.
 */
export interface IAttestationGetRequest {
	/**
	 * The headers which can be used to determine the response data type.
	 */
	headers?: {
		[HeaderTypes.Accept]: typeof MimeTypes.Json | typeof MimeTypes.JsonLd;
	};

	/**
	 * The parameters to be used in the verification.
	 */
	pathParams: {
		/**
		 * The attestation id to verify.
		 */
		id: string;
	};
}
