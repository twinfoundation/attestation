# Interface: IAttestationSignRequest

Sign the data set and return the proof.

## Properties

### body

> **body**: `object`

The data to be used in the signing.

#### attestationNamespace?

> `optional` **attestationNamespace**: `string`

The namespace of the attestation service to use. The service has a built in default if none is supplied.

#### data

> **data**: `string`

The base64 encoded data to sign.

#### keyId

> **keyId**: `string`

The key id from a vault to sign the data.
