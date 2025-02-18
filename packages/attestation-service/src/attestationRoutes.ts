// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	ICreatedResponse,
	IHttpRequestContext,
	INoContentResponse,
	IRestRoute,
	ITag
} from "@twin.org/api-models";
import {
	type IAttestationComponent,
	type IAttestationCreateRequest,
	type IAttestationDestroyRequest,
	type IAttestationGetRequest,
	type IAttestationGetResponse,
	type IAttestationTransferRequest,
	AttestationTypes
} from "@twin.org/attestation-models";
import { ComponentFactory, Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { SchemaOrgTypes } from "@twin.org/standards-schema-org";
import { HeaderTypes, HttpStatusCode, MimeTypes } from "@twin.org/web";

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
	const attestRoute: IRestRoute<IAttestationCreateRequest, ICreatedResponse> = {
		operationId: "attestationCreate",
		summary: "Attest a JSON-LD object",
		tag: tagsAttestation[0].name,
		method: "POST",
		path: `${baseRouteName}/`,
		handler: async (httpRequestContext, request) =>
			attestationCreate(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IAttestationCreateRequest>(),
			examples: [
				{
					id: "attestationCreateRequestExample",
					request: {
						body: {
							attestationObject: {
								"@context": "https://schema.org",
								type: "DigitalDocument",
								name: "bill-of-lading",
								mimeType: "application/pdf",
								fingerprint: "0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
							}
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ICreatedResponse>(),
				examples: [
					{
						id: "attestationCreateResponseExample",
						description: "The response when a new attestation is created.",
						response: {
							statusCode: HttpStatusCode.created,
							headers: {
								[HeaderTypes.Location]:
									"attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg=="
							}
						}
					}
				]
			}
		]
	};

	const getRoute: IRestRoute<IAttestationGetRequest, IAttestationGetResponse> = {
		operationId: "attestationGet",
		summary: "Get an attestation",
		tag: tagsAttestation[0].name,
		method: "GET",
		path: `${baseRouteName}/:id`,
		handler: async (httpRequestContext, request) =>
			attestationGet(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IAttestationGetRequest>(),
			examples: [
				{
					id: "attestationGetRequestExample",
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
				type: nameof<IAttestationGetResponse>(),
				examples: [
					{
						id: "attestationGetResponseExample",
						response: {
							body: {
								"@context": [AttestationTypes.ContextRoot, SchemaOrgTypes.ContextRoot],
								type: AttestationTypes.Information,
								id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg==",
								dateCreated: "2024-06-18T13:34:51Z",
								ownerIdentity:
									"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
								holderIdentity:
									"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
								attestationObject: {
									"@context": "https://schema.org",
									type: "DigitalDocument",
									name: "bill-of-lading",
									mimeType: "application/pdf",
									fingerprint: "0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
								},
								proof: {
									type: AttestationTypes.JwtProof,
									value:
										"eyJraWQiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllI2F0dGVzdGF0aW9uIiwidHlwIjoiSldUIiwiYWxnIjoiRWREU0EifQ.eyJpc3MiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllIiwibmJmIjoxNzE4NzE3NjkxLCJqdGkiOiJ1cm46ZXhhbXBsZToxMjM0NTY3OCIsInZjIjp7IkBjb250ZXh0IjoiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9jRGVzY3JpcHRpb25UeXBlIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRvY05hbWUiOiJiaWxsLW9mLWxhZGluZyIsImZpbmdlcnByaW50IjoiMHhmMGI5NWE5OGIzZGJjNWNlMWM5Y2U1OWQ3MGFmOTVhOTc1OTlmMTAwYTcyOTZlY2RkMWViMTA4YmViZmEwNDdmIiwibWltZVR5cGUiOiJhcHBsaWNhdGlvbi9wZGYifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6ImRpZDppb3RhOnRzdDoweDg5OTJjNDI2MTE2ZjIxYjJhNGM3YTI4NTQzMDA3NDhkM2U5NGE4Y2UwODlkNWJlNjJlMTFmMTA1YmQyYTBmOWUjcmV2b2NhdGlvbiIsInR5cGUiOiJSZXZvY2F0aW9uQml0bWFwMjAyMiIsInJldm9jYXRpb25CaXRtYXBJbmRleCI6IjAifX19.GC0EnIZgYxuUDmXcnejNb7nwsnRv1e1KW2AL0HgzYv9Ab-FTXqkgRk4agYyCDW2cJoDQXcsM1lbnKWPlw6ZBCw"
								},
								verified: true,
								verificationFailure: undefined
							}
						}
					},
					{
						id: "attestationVerifyResponseFailExample",
						response: {
							body: {
								"@context": [AttestationTypes.ContextRoot, SchemaOrgTypes.ContextRoot],
								type: AttestationTypes.Information,
								id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg==",
								dateCreated: "2024-06-18T13:34:51Z",
								ownerIdentity:
									"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
								holderIdentity:
									"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
								attestationObject: {
									"@context": "https://schema.org",
									type: "DigitalDocument",
									name: "bill-of-lading",
									mimeType: "application/pdf",
									fingerprint: "0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
								},
								proof: {
									type: AttestationTypes.JwtProof,
									value:
										"eyJraWQiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllI2F0dGVzdGF0aW9uIiwidHlwIjoiSldUIiwiYWxnIjoiRWREU0EifQ.eyJpc3MiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllIiwibmJmIjoxNzE4NzE3NjkxLCJqdGkiOiJ1cm46ZXhhbXBsZToxMjM0NTY3OCIsInZjIjp7IkBjb250ZXh0IjoiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9jRGVzY3JpcHRpb25UeXBlIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRvY05hbWUiOiJiaWxsLW9mLWxhZGluZyIsImZpbmdlcnByaW50IjoiMHhmMGI5NWE5OGIzZGJjNWNlMWM5Y2U1OWQ3MGFmOTVhOTc1OTlmMTAwYTcyOTZlY2RkMWViMTA4YmViZmEwNDdmIiwibWltZVR5cGUiOiJhcHBsaWNhdGlvbi9wZGYifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6ImRpZDppb3RhOnRzdDoweDg5OTJjNDI2MTE2ZjIxYjJhNGM3YTI4NTQzMDA3NDhkM2U5NGE4Y2UwODlkNWJlNjJlMTFmMTA1YmQyYTBmOWUjcmV2b2NhdGlvbiIsInR5cGUiOiJSZXZvY2F0aW9uQml0bWFwMjAyMiIsInJldm9jYXRpb25CaXRtYXBJbmRleCI6IjAifX19.GC0EnIZgYxuUDmXcnejNb7nwsnRv1e1KW2AL0HgzYv9Ab-FTXqkgRk4agYyCDW2cJoDQXcsM1lbnKWPlw6ZBCw"
								},
								verified: false,
								verificationFailure: "proofFailed"
							}
						}
					}
				]
			},
			{
				type: nameof<IAttestationGetResponse>(),
				mimeType: MimeTypes.JsonLd,
				examples: [
					{
						id: "attestationGetResponseExample",
						response: {
							body: {
								"@context": [AttestationTypes.ContextRoot, SchemaOrgTypes.ContextRoot],
								type: AttestationTypes.Information,
								id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg==",
								dateCreated: "2024-06-18T13:34:51Z",
								ownerIdentity:
									"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
								holderIdentity:
									"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
								attestationObject: {
									"@context": "https://schema.org",
									type: "DigitalDocument",
									name: "bill-of-lading",
									mimeType: "application/pdf",
									fingerprint: "0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
								},
								proof: {
									type: AttestationTypes.JwtProof,
									value:
										"eyJraWQiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllI2F0dGVzdGF0aW9uIiwidHlwIjoiSldUIiwiYWxnIjoiRWREU0EifQ.eyJpc3MiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllIiwibmJmIjoxNzE4NzE3NjkxLCJqdGkiOiJ1cm46ZXhhbXBsZToxMjM0NTY3OCIsInZjIjp7IkBjb250ZXh0IjoiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9jRGVzY3JpcHRpb25UeXBlIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRvY05hbWUiOiJiaWxsLW9mLWxhZGluZyIsImZpbmdlcnByaW50IjoiMHhmMGI5NWE5OGIzZGJjNWNlMWM5Y2U1OWQ3MGFmOTVhOTc1OTlmMTAwYTcyOTZlY2RkMWViMTA4YmViZmEwNDdmIiwibWltZVR5cGUiOiJhcHBsaWNhdGlvbi9wZGYifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6ImRpZDppb3RhOnRzdDoweDg5OTJjNDI2MTE2ZjIxYjJhNGM3YTI4NTQzMDA3NDhkM2U5NGE4Y2UwODlkNWJlNjJlMTFmMTA1YmQyYTBmOWUjcmV2b2NhdGlvbiIsInR5cGUiOiJSZXZvY2F0aW9uQml0bWFwMjAyMiIsInJldm9jYXRpb25CaXRtYXBJbmRleCI6IjAifX19.GC0EnIZgYxuUDmXcnejNb7nwsnRv1e1KW2AL0HgzYv9Ab-FTXqkgRk4agYyCDW2cJoDQXcsM1lbnKWPlw6ZBCw"
								},
								verified: true,
								verificationFailure: undefined
							}
						}
					},
					{
						id: "attestationVerifyResponseFailExample",
						response: {
							body: {
								"@context": [AttestationTypes.ContextRoot, SchemaOrgTypes.ContextRoot],
								type: AttestationTypes.Information,
								id: "attestation:iota:aW90YS1uZnQ6dHN0OjB4NzYyYjljNDllYTg2OWUwZWJkYTliYmZhNzY5Mzk0NDdhNDI4ZGNmMTc4YzVkMTVhYjQ0N2UyZDRmYmJiNGViMg==",
								dateCreated: "2024-06-18T13:34:51Z",
								ownerIdentity:
									"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
								holderIdentity:
									"did:iota:tst:0x8992c426116f21b2a4c7a2854300748d3e94a8ce089d5be62e11f105bd2a0f9e",
								attestationObject: {
									"@context": "https://schema.org",
									type: "DigitalDocument",
									name: "bill-of-lading",
									mimeType: "application/pdf",
									fingerprint: "0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
								},
								proof: {
									type: AttestationTypes.JwtProof,
									value:
										"eyJraWQiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllI2F0dGVzdGF0aW9uIiwidHlwIjoiSldUIiwiYWxnIjoiRWREU0EifQ.eyJpc3MiOiJkaWQ6aW90YTp0c3Q6MHg4OTkyYzQyNjExNmYyMWIyYTRjN2EyODU0MzAwNzQ4ZDNlOTRhOGNlMDg5ZDViZTYyZTExZjEwNWJkMmEwZjllIiwibmJmIjoxNzE4NzE3NjkxLCJqdGkiOiJ1cm46ZXhhbXBsZToxMjM0NTY3OCIsInZjIjp7IkBjb250ZXh0IjoiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9jRGVzY3JpcHRpb25UeXBlIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRvY05hbWUiOiJiaWxsLW9mLWxhZGluZyIsImZpbmdlcnByaW50IjoiMHhmMGI5NWE5OGIzZGJjNWNlMWM5Y2U1OWQ3MGFmOTVhOTc1OTlmMTAwYTcyOTZlY2RkMWViMTA4YmViZmEwNDdmIiwibWltZVR5cGUiOiJhcHBsaWNhdGlvbi9wZGYifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6ImRpZDppb3RhOnRzdDoweDg5OTJjNDI2MTE2ZjIxYjJhNGM3YTI4NTQzMDA3NDhkM2U5NGE4Y2UwODlkNWJlNjJlMTFmMTA1YmQyYTBmOWUjcmV2b2NhdGlvbiIsInR5cGUiOiJSZXZvY2F0aW9uQml0bWFwMjAyMiIsInJldm9jYXRpb25CaXRtYXBJbmRleCI6IjAifX19.GC0EnIZgYxuUDmXcnejNb7nwsnRv1e1KW2AL0HgzYv9Ab-FTXqkgRk4agYyCDW2cJoDQXcsM1lbnKWPlw6ZBCw"
								},
								verified: false,
								verificationFailure: "proofFailed"
							}
						}
					}
				]
			}
		],
		skipAuth: true
	};

	const transferRoute: IRestRoute<IAttestationTransferRequest, INoContentResponse> = {
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
								"did:iota:tst:0x06ae1034f9f4af1b408a0b54e877bb476259666a14f221400d3746aecefa7105",
							holderAddress: "tst1prctjk5ck0dutnsunnje6u90jk5htx03qznjjmkd6843pzltlgz87srjzzv"
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

	return [attestRoute, getRoute, transferRoute, destroyRoute];
}

/**
 * Sign the data and return the proof.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function attestationCreate(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IAttestationCreateRequest
): Promise<ICreatedResponse> {
	Guards.object<IAttestationCreateRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<IAttestationCreateRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);
	Guards.object(
		ROUTES_SOURCE,
		nameof(request.body.attestationObject),
		request.body.attestationObject
	);
	const component = ComponentFactory.get<IAttestationComponent>(componentName);
	const id = await component.create(
		request.body.attestationObject,
		request.body.namespace,
		httpRequestContext.userIdentity,
		httpRequestContext.nodeIdentity
	);
	return {
		statusCode: HttpStatusCode.created,
		headers: {
			[HeaderTypes.Location]: id
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
export async function attestationGet(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IAttestationGetRequest
): Promise<IAttestationGetResponse> {
	Guards.object<IAttestationGetRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<IAttestationGetRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);

	const mimeType = request.headers?.[HeaderTypes.Accept] === MimeTypes.JsonLd ? "jsonld" : "json";

	const component = ComponentFactory.get<IAttestationComponent>(componentName);
	const verificationResult = await component.get(request.pathParams.id);

	return {
		headers: {
			[HeaderTypes.ContentType]: mimeType === "json" ? MimeTypes.Json : MimeTypes.JsonLd
		},
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
): Promise<INoContentResponse> {
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
	await component.transfer(
		request.pathParams.id,
		request.body.holderIdentity,
		request.body.holderAddress,
		httpRequestContext.userIdentity
	);

	return {
		statusCode: HttpStatusCode.noContent
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
