# Class: AttestationClient

Client for performing attestation through to REST endpoints.

## Extends

- `BaseRestClient`

## Implements

- `IAttestationComponent`

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

## Properties

### CLASS\_NAME

> `readonly` **CLASS\_NAME**: `string`

Runtime name for the class.

#### Implementation of

`IAttestationComponent.CLASS_NAME`

## Methods

### attest()

> **attest**(`verificationMethodId`, `data`, `namespace`?): `Promise`\<`IAttestationInformation`\>

Attest the data and return the collated information.

#### Parameters

• **verificationMethodId**: `string`

The identity verification method to use for attesting the data.

• **data**: `IJsonLdNodeObject`

The data to attest.

• **namespace?**: `string`

The namespace of the connector to use for the attestation, defaults to component configured namespace.

#### Returns

`Promise`\<`IAttestationInformation`\>

The collated attestation data.

#### Implementation of

`IAttestationComponent.attest`

***

### verify()

> **verify**(`attestationId`): `Promise`\<`object`\>

Resolve and verify the attestation id.

#### Parameters

• **attestationId**: `string`

The attestation id to verify.

#### Returns

`Promise`\<`object`\>

The verified attestation details.

##### verified

> **verified**: `boolean`

##### failure?

> `optional` **failure**: `string`

##### information?

> `optional` **information**: `Partial`\<`IAttestationInformation`\>

#### Implementation of

`IAttestationComponent.verify`

***

### transfer()

> **transfer**(`attestationId`, `holderIdentity`): `Promise`\<`IAttestationInformation`\>

Transfer the attestation to a new holder.

#### Parameters

• **attestationId**: `string`

The attestation to transfer.

• **holderIdentity**: `string`

The identity to transfer the attestation to.

#### Returns

`Promise`\<`IAttestationInformation`\>

The updated attestation details.

#### Implementation of

`IAttestationComponent.transfer`

***

### destroy()

> **destroy**(`attestationId`): `Promise`\<`void`\>

Destroy the attestation.

#### Parameters

• **attestationId**: `string`

The attestation to transfer.

#### Returns

`Promise`\<`void`\>

The updated attestation details.

#### Implementation of

`IAttestationComponent.destroy`
