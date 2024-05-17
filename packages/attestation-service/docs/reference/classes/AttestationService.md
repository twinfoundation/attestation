# Class: AttestationService

Service for performing attestation operations to a connector.

## Implements

- `IAttestation`

## Constructors

### new AttestationService()

> **new AttestationService**(`dependencies`): [`AttestationService`](AttestationService.md)

Create a new instance of AttestationService.

#### Parameters

• **dependencies**

The connectors to use.

• **dependencies.attestationConnector**: `IAttestationConnector`

The attestation connector.

#### Returns

[`AttestationService`](AttestationService.md)

## Methods

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
