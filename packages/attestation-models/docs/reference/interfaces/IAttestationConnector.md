# Interface: IAttestationConnector

Interface describing an attestation connector.

## Extends

- `IComponent`

## Methods

### attest()

> **attest**(`controller`, `address`, `verificationMethodId`, `data`): `Promise`\<[`IAttestationInformation`](IAttestationInformation.md)\>

Attest the data and return the collated information.

#### Parameters

• **controller**: `string`

The controller identity of the user to access the vault keys.

• **address**: `string`

The controller address for the attestation.

• **verificationMethodId**: `string`

The identity verification method to use for attesting the data.

• **data**: `IJsonLdNodeObject`

The data to attest.

#### Returns

`Promise`\<[`IAttestationInformation`](IAttestationInformation.md)\>

The collated attestation data.

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

> `optional` **information**: `Partial`\<[`IAttestationInformation`](IAttestationInformation.md)\>

***

### transfer()

> **transfer**(`controller`, `attestationId`, `holderIdentity`, `holderAddress`): `Promise`\<[`IAttestationInformation`](IAttestationInformation.md)\>

Transfer the attestation to a new holder.

#### Parameters

• **controller**: `string`

The controller identity of the user to access the vault keys.

• **attestationId**: `string`

The attestation to transfer.

• **holderIdentity**: `string`

The holder identity of the attestation.

• **holderAddress**: `string`

The new controller address of the attestation belonging to the holder.

#### Returns

`Promise`\<[`IAttestationInformation`](IAttestationInformation.md)\>

The updated attestation details.

***

### destroy()

> **destroy**(`controller`, `attestationId`): `Promise`\<`void`\>

Destroy the attestation.

#### Parameters

• **controller**: `string`

The controller identity of the user to access the vault keys.

• **attestationId**: `string`

The attestation to destroy.

#### Returns

`Promise`\<`void`\>

Nothing.
