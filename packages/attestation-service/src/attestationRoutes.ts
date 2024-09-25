// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IHttpRequestContext,
	INoContentResponse,
	IRestRoute,
	ITag
} from "@twin.org/api-models";
import type {
	IAttestationAttestRequest,
	IAttestationAttestResponse,
	IAttestationComponent,
	IAttestationDestroyRequest,
	IAttestationTransferRequest,
	IAttestationTransferResponse,
	IAttestationVerifyRequest,
	IAttestationVerifyResponse
} from "@twin.org/attestation-models";
import { ComponentFactory, Guards } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { nameof } from "@twin.org/nameof";
import { HttpStatusCode } from "@twin.org/web";

/**
 * The source used when communicating about these routes.
 */
const ROUTES_SOURCE = "attestationRoutes";

/**
 * The tag to associate with the routes.
 */
export const tagsAttestation: ITag[] = [
	{
		name: "Attestation",
		description: "Endpoints which are modelled to access an attestation contract."
	}
];

/**
 * The REST routes for attestation.
 * @param baseRouteName Prefix to prepend to the paths.
 * @param componentName The name of the component to use in the routes stored in the ComponentFactory.
 * @returns The generated routes.
 */
export function generateRestRoutesAttestation(
	baseRouteName: string,
	componentName: string
): IRestRoute[] {
	const attestRoute: IRestRoute<IAttestationAttestRequest, IAttestationAttestResponse> = {
		operationId: "attestationAttest",
		summary: "Attest a JSON-LD object",
		tag: tagsAttestation[0].name,
		method: "POST",
		path: `${baseRouteName}/`,
		handler: async (httpRequestContext, request) =>
			attestationAttest(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IAttestationAttestRequest>(),
			examples: [
				{
					id: "attestationAttestExample",
					request: {
						body: {
							verificationMethodId:
								"did:iota:tst:0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f#attestation",
							data: {
								"@context": "https://schema.org",
								type: "DigitalDocument",
								name: "bill-of-lading",
								mimeType: "application/pdf",
								fingerprint: "0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
							} as IJsonLdNodeObject
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IAttestationAttestResponse>(),
				examples: [
					{
						id: "attestationAttestResponseExample",
						response: {
							body: {
								information: {
									id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg==",
									created: "2024-06-18T13:34:51Z",
									ownerIdentity:
										"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
									holderIdentity:
										"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
									data: {
										"@context": "https://schema.org",
										type: "DigitalDocument",
										name: "bill-of-lading",
										mimeType: "application/pdf",
										fingerprint:
											"0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
									} as IJsonLdNodeObject,
									proof: {
										type: "jwt",
										value:
											"eyJraWQiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllI2F0dGVzdGF0aW9uIiwidHlwIjoiSldUIiwiYWxnIjoiRWREU0EifQ.eyJpc3MiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllIiwibmJmIjoxNzE4NzE3NjkxLCJqdGkiOiJ1cm46ZXhhbXBsZToxMjM0NTY3OCIsInZjIjp7IkBjb250ZXh0IjoiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9jRGVzY3JpcHRpb25UeXBlIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRvY05hbWUiOiJiaWxsLW9mLWxhZGluZyIsImZpbmdlcnByaW50IjoiMHhmMGI5NWE5OGIzZGJjNWNlMWM5Y2U1OWQ3MGFmOTVhOTc1OTlmMTAwYTcyOTZlY2RkMWViMTA4YmViZmEwNDdmIiwibWltZVR5cGUiOiJhcHBsaWNhdGlvbi9wZGYifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6ImRpZDppb3RhOnRzdDoweDg5OTJjNDI2MTE2ZjIxYjJhNGM3YTI4NTQzMDA3NDhkM2U5NGE4Y2UwODlkNWJlNjJlMTFmMTA1YmQyYTBmOWUjcmV2b2NhdGlvbiIsInR5cGUiOiJSZXZvY2F0aW9uQml0bWFwMjAyMiIsInJldm9jYXRpb25CaXRtYXBJbmRleCI6IjAifX19.GC0EnIZgYxuUDmXcnejNb7nwsnRv1e1KW2AL0HgzYv9Ab-FTXqkgRk4agYyCDW2cJoDQXcsM1lbnKWPlw6ZBCw"
									}
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
		summary: "Verify an attestation",
		tag: tagsAttestation[0].name,
		method: "GET",
		path: `${baseRouteName}/:id`,
		handler: async (httpRequestContext, request) =>
			attestationVerify(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IAttestationVerifyRequest>(),
			examples: [
				{
					id: "attestationVerifyRequestExample",
					request: {
						pathParams: {
							id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg=="
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
								verified: true,
								failure: undefined,
								information: {
									id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg==",
									created: "2024-06-18T13:34:51Z",
									ownerIdentity:
										"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
									holderIdentity:
										"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
									data: {
										"@context": "https://schema.org",
										type: "DigitalDocument",
										name: "bill-of-lading",
										mimeType: "application/pdf",
										fingerprint:
											"0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
									} as IJsonLdNodeObject,
									proof: {
										type: "jwt",
										value:
											"eyJraWQiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllI2F0dGVzdGF0aW9uIiwidHlwIjoiSldUIiwiYWxnIjoiRWREU0EifQ.eyJpc3MiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllIiwibmJmIjoxNzE4NzE3NjkxLCJqdGkiOiJ1cm46ZXhhbXBsZToxMjM0NTY3OCIsInZjIjp7IkBjb250ZXh0IjoiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9jRGVzY3JpcHRpb25UeXBlIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRvY05hbWUiOiJiaWxsLW9mLWxhZGluZyIsImZpbmdlcnByaW50IjoiMHhmMGI5NWE5OGIzZGJjNWNlMWM5Y2U1OWQ3MGFmOTVhOTc1OTlmMTAwYTcyOTZlY2RkMWViMTA4YmViZmEwNDdmIiwibWltZVR5cGUiOiJhcHBsaWNhdGlvbi9wZGYifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6ImRpZDppb3RhOnRzdDoweDg5OTJjNDI2MTE2ZjIxYjJhNGM3YTI4NTQzMDA3NDhkM2U5NGE4Y2UwODlkNWJlNjJlMTFmMTA1YmQyYTBmOWUjcmV2b2NhdGlvbiIsInR5cGUiOiJSZXZvY2F0aW9uQml0bWFwMjAyMiIsInJldm9jYXRpb25CaXRtYXBJbmRleCI6IjAifX19.GC0EnIZgYxuUDmXcnejNb7nwsnRv1e1KW2AL0HgzYv9Ab-FTXqkgRk4agYyCDW2cJoDQXcsM1lbnKWPlw6ZBCw"
									}
								}
							}
						}
					},
					{
						id: "attestationVerifyResponseFailExample",
						response: {
							body: {
								verified: false,
								failure: "proofFailed",
								information: {
									id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg==",
									created: "2024-06-18T13:34:51Z",
									ownerIdentity:
										"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
									holderIdentity:
										"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
									data: {
										"@context": "https://schema.org",
										type: "DigitalDocument",
										name: "bill-of-lading",
										mimeType: "application/pdf",
										fingerprint:
											"0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
									} as IJsonLdNodeObject,
									proof: {
										type: "jwt",
										value:
											"eyJraWQiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllI2F0dGVzdGF0aW9uIiwidHlwIjoiSldUIiwiYWxnIjoiRWREU0EifQ.eyJpc3MiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllIiwibmJmIjoxNzE4NzE3NjkxLCJqdGkiOiJ1cm46ZXhhbXBsZToxMjM0NTY3OCIsInZjIjp7IkBjb250ZXh0IjoiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9jRGVzY3JpcHRpb25UeXBlIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRvY05hbWUiOiJiaWxsLW9mLWxhZGluZyIsImZpbmdlcnByaW50IjoiMHhmMGI5NWE5OGIzZGJjNWNlMWM5Y2U1OWQ3MGFmOTVhOTc1OTlmMTAwYTcyOTZlY2RkMWViMTA4YmViZmEwNDdmIiwibWltZVR5cGUiOiJhcHBsaWNhdGlvbi9wZGYifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6ImRpZDppb3RhOnRzdDoweDg5OTJjNDI2MTE2ZjIxYjJhNGM3YTI4NTQzMDA3NDhkM2U5NGE4Y2UwODlkNWJlNjJlMTFmMTA1YmQyYTBmOWUjcmV2b2NhdGlvbiIsInR5cGUiOiJSZXZvY2F0aW9uQml0bWFwMjAyMiIsInJldm9jYXRpb25CaXRtYXBJbmRleCI6IjAifX19.GC0EnIZgYxuUDmXcnejNb7nwsnRv1e1KW2AL0HgzYv9Ab-FTXqkgRk4agYyCDW2cJoDQXcsM1lbnKWPlw6ZBCw"
									}
								}
							}
						}
					}
				]
			}
		],
		skipAuth: true
	};

	const transferRoute: IRestRoute<IAttestationTransferRequest, IAttestationTransferResponse> = {
		operationId: "attestationTransfer",
		summary: "Transfer an attestation",
		tag: tagsAttestation[0].name,
		method: "PUT",
		path: `${baseRouteName}/:id/transfer`,
		handler: async (httpRequestContext, request) =>
			attestationTransfer(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IAttestationTransferRequest>(),
			examples: [
				{
					id: "attestationTransferRequestExample",
					request: {
						pathParams: {
							id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg=="
						},
						body: {
							holderIdentity:
								"did:iota:tst:0x06ae1034f9f4af1b408a0b54e877bb476259666a14f221400d3746aecefa7105"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IAttestationTransferResponse>(),
				examples: [
					{
						id: "attestationTransferResponseExample",
						response: {
							body: {
								information: {
									id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg==",
									created: "2024-06-18T13:34:51Z",
									ownerIdentity:
										"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
									holderIdentity:
										"did:iota:tst:0x06ae1034f9f4af1b408a0b54e877bb476259666a14f221400d3746aecefa7105",
									transferred: "2024-06-18T13:35:45.642Z",
									data: {
										"@context": "https://schema.org",
										type: "DigitalDocument",
										name: "bill-of-lading",
										fingerprint:
											"0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f",
										mimeType: "application/pdf"
									} as IJsonLdNodeObject,
									proof: {
										type: "jwt",
										value:
											"eyJraWQiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllI2F0dGVzdGF0aW9uIiwidHlwIjoiSldUIiwiYWxnIjoiRWREU0EifQ.eyJpc3MiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllIiwibmJmIjoxNzE4NzE3NjkxLCJqdGkiOiJ1cm46ZXhhbXBsZToxMjM0NTY3OCIsInZjIjp7IkBjb250ZXh0IjoiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9jRGVzY3JpcHRpb25UeXBlIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRvY05hbWUiOiJiaWxsLW9mLWxhZGluZyIsImZpbmdlcnByaW50IjoiMHhmMGI5NWE5OGIzZGJjNWNlMWM5Y2U1OWQ3MGFmOTVhOTc1OTlmMTAwYTcyOTZlY2RkMWViMTA4YmViZmEwNDdmIiwibWltZVR5cGUiOiJhcHBsaWNhdGlvbi9wZGYifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6ImRpZDppb3RhOnRzdDoweDg5OTJjNDI2MTE2ZjIxYjJhNGM3YTI4NTQzMDA3NDhkM2U5NGE4Y2UwODlkNWJlNjJlMTFmMTA1YmQyYTBmOWUjcmV2b2NhdGlvbiIsInR5cGUiOiJSZXZvY2F0aW9uQml0bWFwMjAyMiIsInJldm9jYXRpb25CaXRtYXBJbmRleCI6IjAifX19.GC0EnIZgYxuUDmXcnejNb7nwsnRv1e1KW2AL0HgzYv9Ab-FTXqkgRk4agYyCDW2cJoDQXcsM1lbnKWPlw6ZBCw"
									}
								}
							}
						}
					}
				]
			}
		]
	};

	const destroyRoute: IRestRoute<IAttestationDestroyRequest, INoContentResponse> = {
		operationId: "attestationDestroy",
		summary: "Destroy an attestation",
		tag: tagsAttestation[0].name,
		method: "DELETE",
		path: `${baseRouteName}/:id`,
		handler: async (httpRequestContext, request) =>
			attestationDestroy(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IAttestationDestroyRequest>(),
			examples: [
				{
					id: "attestationDestroyExample",
					request: {
						pathParams: {
							id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg=="
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>()
			}
		]
	};

	return [attestRoute, verifyRoute, transferRoute, destroyRoute];
}

/**
 * Sign the data and return the proof.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function attestationAttest(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IAttestationAttestRequest
): Promise<IAttestationAttestResponse> {
	Guards.object<IAttestationAttestRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<IAttestationAttestRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);
	Guards.stringValue(
		ROUTES_SOURCE,
		nameof(request.body.verificationMethodId),
		request.body.verificationMethodId
	);
	Guards.object(ROUTES_SOURCE, nameof(request.body.data), request.body.data);
	const component = ComponentFactory.get<IAttestationComponent>(componentName);
	const information = await component.attest(
		request.body.verificationMethodId,
		request.body.data,
		request.body.namespace,
		httpRequestContext.userIdentity,
		httpRequestContext.nodeIdentity
	);
	return {
		body: {
			information
		}
	};
}

/**
 * Resolve and verify the attestation id.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function attestationVerify(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IAttestationVerifyRequest
): Promise<IAttestationVerifyResponse> {
	Guards.object<IAttestationVerifyRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<IAttestationVerifyRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);

	const component = ComponentFactory.get<IAttestationComponent>(componentName);
	const verificationResult = await component.verify<IJsonLdNodeObject>(request.pathParams.id);

	return {
		body: verificationResult
	};
}

/**
 * Transfer the attestation to a new holder.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function attestationTransfer(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IAttestationTransferRequest
): Promise<IAttestationTransferResponse> {
	Guards.object<IAttestationTransferRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<IAttestationTransferRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);
	Guards.object<IAttestationTransferRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);
	Guards.stringValue(
		ROUTES_SOURCE,
		nameof(request.body.holderIdentity),
		request.body.holderIdentity
	);

	const component = ComponentFactory.get<IAttestationComponent>(componentName);
	const information = await component.transfer<IJsonLdNodeObject>(
		request.pathParams.id,
		request.body.holderIdentity,
		httpRequestContext.userIdentity
	);

	return {
		body: {
			information
		}
	};
}

/**
 * Destroy the attestation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function attestationDestroy(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IAttestationDestroyRequest
): Promise<INoContentResponse> {
	Guards.object<IAttestationDestroyRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<IAttestationDestroyRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);

	const component = ComponentFactory.get<IAttestationComponent>(componentName);
	await component.destroy(request.pathParams.id, httpRequestContext.userIdentity);

	return {
		statusCode: HttpStatusCode.noContent
	};
}
