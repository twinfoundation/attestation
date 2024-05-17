# Class: AttestationService

Service for performing attestation operations to a connector.

## Implements

- `IAttestation`

## Constructors

### new AttestationService()

> **new AttestationService**(`dependencies`, `config`?): [`AttestationService`](AttestationService.md)

Create a new instance of AttestationService.

#### Parameters

• **dependencies**

The connectors to use.

• **dependencies.blobStorageConnection**: `IBlobStorageConnector`

The connection to the blob storage.

• **config?**: [`IAttestationServiceConfig`](../interfaces/IAttestationServiceConfig.md)

The configuration for the service.

#### Returns

[`AttestationService`](AttestationService.md)

## Methods

### sign()

> **sign**(`requestContext`, `keyId`, `data`, `attestationNamespace`?): `Promise`\<`IAttestationProof`\>

Sign the data and return the proof.

#### Parameters

• **requestContext**: `IRequestContext`

The context for the request.

• **keyId**: `string`

The key id from a vault to sign the data.

• **data**: `string`

The data to store in blob storage and sign as base64.

• **attestationNamespace?**: `string`

The namespace of the attestation service to use. The service has a built in default if none is supplied.

#### Returns

`Promise`\<`IAttestationProof`\>

The proof for the data with the id set as a unique identifier for the data.

#### Implementation of

`IAttestation.sign`

***

### verify()

> **verify**(`requestContext`, `proof`): `Promise`\<`boolean`\>

Verify the data against the proof.

#### Parameters

• **requestContext**: `IRequestContext`

The context for the request.

• **proof**: `IAttestationProof`

The proof to verify against.

#### Returns

`Promise`\<`boolean`\>

True if the verification is successful.

#### Implementation of

`IAttestation.verify`
