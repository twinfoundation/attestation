# TWIN Attestation

This mono-repository contains the packages to use with attestation in TWIN applications.

## Packages

- [attestation-models](packages/attestation-models/README.md) - Models which define the structure of the attestation contracts and connectors.
- [attestation-connector-entity-storage](packages/attestation-connector-entity-storage/README.md) - Attestation connector implementation using entity storage.
- [attestation-connector-open-attestation](packages/attestation-connector-open-attestation/README.md) - Attestation connector implementation using [OpenAttestation](https://www.openattestation.com/).
- [attestation-service](packages/attestation-service/README.md) - Attestation contract implementation and REST endpoint definitions.
- [attestation-rest-client](packages/attestation-rest-client/README.md) - Attestation contract implementation which can connect to REST endpoints.

## Apps

- [attestation-cli](apps/attestation-cli/README.md) - A command line interface for interacting with the attestation APIs.

## Contributing

To contribute to this package see the guidelines for building and publishing in [CONTRIBUTING](./CONTRIBUTING.md)
