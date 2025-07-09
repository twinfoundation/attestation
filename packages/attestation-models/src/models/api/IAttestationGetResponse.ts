// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HeaderTypes, MimeTypes } from "@twin.org/web";
import type { IAttestationInformation } from "../IAttestationInformation";

/**
 * The response to verifying the attestation.
 */
export interface IAttestationGetResponse {
	/**
	 * The headers which can be used to determine the response data type.
	 */
	headers?: {
		[HeaderTypes.ContentType]: typeof MimeTypes.Json | typeof MimeTypes.JsonLd;
	};

	/**
	 * The data returned from the verification response.
	 */
	body: IAttestationInformation;
}
