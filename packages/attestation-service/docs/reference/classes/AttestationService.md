# Class: AttestationService

Service for performing attestation operations to a connector.

## Implements

- `IAttestationComponent`

## Constructors

### Constructor

> **new AttestationService**(`options?`): `AttestationService`

Create a new instance of AttestationService.

#### Parameters

##### options?

[`IAttestationServiceConstructorOptions`](../interfaces/IAttestationServiceConstructorOptions.md)

The options for the service.

#### Returns

`AttestationService`

## Properties

### CLASS\_NAME

> `readonly` **CLASS\_NAME**: `string`

Runtime name for the class.

#### Implementation of

`IAttestationComponent.CLASS_NAME`

## Methods

### create()

> **create**(`attestationObject`, `namespace?`, `identity?`, `nodeIdentity?`): `Promise`\<`string`\>

Attest the data and return the collated information.

#### Parameters

##### attestationObject

`IJsonLdNodeObject`

The data to attest.

##### namespace?

`string`

The namespace of the connector to use for the attestation, defaults to service configured namespace.

##### identity?

`string`

The identity to perform the attestation operation with.

##### nodeIdentity?

`string`

The node identity to include in the attestation.

#### Returns

`Promise`\<`string`\>

The id.

#### Implementation of

`IAttestationComponent.create`

***

### get()

> **get**(`id`): `Promise`\<`IAttestationInformation`\>

Resolve and verify the attestation id.

#### Parameters

##### id

`string`

The attestation id to verify.

#### Returns

`Promise`\<`IAttestationInformation`\>

The verified attestation details.

#### Implementation of

`IAttestationComponent.get`

***

### transfer()

> **transfer**(`attestationId`, `holderIdentity`, `holderAddress`, `identity`): `Promise`\<`void`\>

Transfer the attestation to a new holder.

#### Parameters

##### attestationId

`string`

The attestation to transfer.

##### holderIdentity

`string`

The identity to transfer the attestation to.

##### holderAddress

`string`

The address to transfer the attestation to.

##### identity

`string`

The identity to perform the attestation operation with.

#### Returns

`Promise`\<`void`\>

The updated attestation details.

#### Implementation of

`IAttestationComponent.transfer`

***

### destroy()

> **destroy**(`attestationId`, `identity?`): `Promise`\<`void`\>

Destroy the attestation.

#### Parameters

##### attestationId

`string`

The attestation to transfer.

##### identity?

`string`

The identity to perform the attestation operation with.

#### Returns

`Promise`\<`void`\>

The updated attestation details.

#### Implementation of

`IAttestationComponent.destroy`
