# Class: AttestationClient

Client for performing attestation through to REST endpoints.

## Extends

- `BaseRestClient`

## Implements

- `IAttestation`

## Constructors

### new AttestationClient()

> **new AttestationClient**(`config`): [`AttestationClient`](AttestationClient.md)

Create a new instance of AttestationClient.

#### Parameters

• **config**: `IBaseRestClientConfig`

The configuration for the client.

#### Returns

[`AttestationClient`](AttestationClient.md)

#### Overrides

`BaseRestClient.constructor`

## Methods

### fetch()

> **fetch**\<`T`, `U`\>(`requestContext`, `route`, `method`, `request`?): `Promise`\<`U`\>

Perform a request in json format.

#### Type parameters

• **T** *extends* `IHttpRequest`\<`unknown`\>

• **U** *extends* `IHttpResponse`\<`unknown`\>

#### Parameters

• **requestContext**: `IRequestContext`

The context for the request.

• **route**: `string`

The route of the request.

• **method**: `HttpMethods`

The http method.

• **request?**: `T`

Request to send to the endpoint.

#### Returns

`Promise`\<`U`\>

The response.

#### Inherited from

`BaseRestClient.fetch`

***

### getEndpointWithPrefix()

> **getEndpointWithPrefix**(): `string`

Get the endpoint with the prefix for the namespace.

#### Returns

`string`

The endpoint with namespace prefix attached.

#### Inherited from

`BaseRestClient.getEndpointWithPrefix`

***

### sign()

> **sign**(`requestContext`, `data`): `Promise`\<`IDidProof`\>

Sign the data and return the proof.

#### Parameters

• **requestContext**: `IRequestContext`

The context for the request.

• **data**: `unknown`

The data to sign.

#### Returns

`Promise`\<`IDidProof`\>

The proof for the data with the id set as a unique identifier for the data.

#### Implementation of

`IAttestation.sign`

***

### verify()

> **verify**(`requestContext`, `data`, `proof`): `Promise`\<`boolean`\>

Verify the data against the proof the proof.

#### Parameters

• **requestContext**: `IRequestContext`

The context for the request.

• **data**: `unknown`

The data to verify.

• **proof**: `IDidProof`

The proof to verify against.

#### Returns

`Promise`\<`boolean`\>

True if the verification is successful.

#### Implementation of

`IAttestation.verify`
