// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import type { IRestRoute, ITag } from "@gtsc/api-models";
import type {
	IAttestation,
	IAttestationSignRequest,
	IAttestationSignResponse,
	IAttestationVerifyRequest,
	IAttestationVerifyResponse
} from "@gtsc/attestation-models";
import { Guards } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import { ServiceFactory, type IRequestContext } from "@gtsc/services";

/**
 * The source used when communicating about these routes.
 */
const ROUTES_SOURCE = "attestationRoutes";

/**
 * The tag to associate with the routes.
 */
export const tags: ITag[] = [
	{
		name: "Attestation",
		description: "Endpoints which are modelled to access a attestation contract."
	}
];

/**
 * The REST routes for attestation.
 * @param baseRouteName Prefix to prepend to the paths.
 * @param factoryServiceName The name of the service to use in the routes store in the ServiceFactory.
 * @returns The generated routes.
 */
export function generateRestRoutes(
	baseRouteName: string,
	factoryServiceName: string
): IRestRoute[] {
	const signRoute: IRestRoute<IAttestationSignRequest, IAttestationSignResponse> = {
		operationId: "attestationSign",
		summary: "Sign a data set",
		tag: tags[0].name,
		method: "POST",
		path: `${baseRouteName}/sign/`,
		handler: async (requestContext, request, body) =>
			attestationSign(requestContext, factoryServiceName, request, body),
		requestType: {
			type: nameof<IAttestationSignRequest>(),
			examples: [
				{
					id: "attestationSignExample",
					request: {
						body: {
							data: {
								docName: "foo",
								docType: "test-doc-type"
							}
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IAttestationSignResponse>(),
				examples: [
					{
						id: "attestationSignResponseExample",
						response: {
							body: {
								proof: {
									type: "Ed25519Signature2018",
									proofPurpose: "assertionMethod",
									created: new Date().toISOString(),
									proofValue: "1d9f8d9sd9fjeiweob50ac63129782a1c3y837f6s78s8cg8hjg76hj5h342k33h"
								}
							}
						}
					}
				]
			}
		]
	};

	const verifyRoute: IRestRoute<IAttestationVerifyRequest, IAttestationVerifyResponse> = {
		operationId: "attestationVerify",
		summary: "Verify a data set and proof",
		tag: tags[0].name,
		method: "POST",
		path: `${baseRouteName}/verify/`,
		handler: async (requestContext, request, body) =>
			attestationVerify(requestContext, factoryServiceName, request, body),
		requestType: {
			type: nameof<IAttestationVerifyRequest>(),
			examples: [
				{
					id: "attestationVerifyExample",
					request: {
						body: {
							data: {
								docName: "foo",
								docType: "test-doc-type"
							},
							proof: {
								type: "Ed25519Signature2018",
								proofPurpose: "assertionMethod",
								created: new Date().toISOString(),
								proofValue: "1d9f8d9sd9fjeiweob50ac63129782a1c3y837f6s78s8cg8hjg76hj5h342k33h"
							}
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IAttestationVerifyResponse>(),
				examples: [
					{
						id: "attestationVerifyResponseExample",
						response: {
							body: {
								verified: true
							}
						}
					}
				]
			}
		]
	};

	return [signRoute, verifyRoute];
}

/**
 * Sign the data and return the proof.
 * @param requestContext The request context for the API.
 * @param factoryServiceName The name of the service to use in the routes.
 * @param request The request.
 * @param body The body if required for pure content.
 * @returns The response object with additional http response properties.
 */
export async function attestationSign(
	requestContext: IRequestContext,
	factoryServiceName: string,
	request: IAttestationSignRequest,
	body?: unknown
): Promise<IAttestationSignResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.body), request.body);
	Guards.object(ROUTES_SOURCE, nameof(request.body.data), request.body.data);
	const service = ServiceFactory.get<IAttestation>(factoryServiceName);
	const proof = await service.sign(requestContext, request.body);
	return {
		body: {
			proof
		}
	};
}

/**
 * Verify the data and proof.
 * @param requestContext The request context for the API.
 * @param factoryServiceName The name of the service to use in the routes.
 * @param request The request.
 * @param body The body if required for pure content.
 * @returns The response object with additional http response properties.
 */
export async function attestationVerify(
	requestContext: IRequestContext,
	factoryServiceName: string,
	request: IAttestationVerifyRequest,
	body?: unknown
): Promise<IAttestationVerifyResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.body), request.body);
	Guards.object(ROUTES_SOURCE, nameof(request.body.data), request.body.data);
	Guards.object(ROUTES_SOURCE, nameof(request.body.proof), request.body.proof);
	const service = ServiceFactory.get<IAttestation>(factoryServiceName);
	const verified = await service.verify(requestContext, request.body, request.body.proof);
	return {
		body: {
			verified
		}
	};
}
