import { ethers } from 'hardhat';
import { packValidatorParams } from '../test/utils/pack-utils';
import { calculateQueryHash } from '../test/utils/utils';

const Operators = {
  NOOP: 0, // No operation, skip query verification in circuit
  EQ: 1, // equal
  LT: 2, // less than
  GT: 3, // greater than
  IN: 4, // in
  NIN: 5, // not in
  NE: 6 // not equal
};

async function main() {
  const schema = '74977327600848231385663280181476307657';
  const schemaClaimPathKey =
    '20376033832371109177683048456014525905119173674985843915445634726167450989630';
  const schemaUrl =
    'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld';
  const type = 'KYCAgeCredential';
  const value = [20020101, ...new Array(63).fill(0)];
  const slotIndex = 0;

  const contractName = 'KYCVerifier';
  const ERC1155ContractFactory = await ethers.getContractFactory(contractName);
  const erc1155instance = await ERC1155ContractFactory.deploy();
  const claimPathDoesntExist = 0;

  await erc1155instance.deployed();
  console.log(contractName, 'deployed to:', erc1155instance.address);

  const circuitIdSig = 'credentialAtomicQuerySigV2OnChain';

  const validatorAddressSig = '0x1E4a22540E293C0e5E8c33DAfd6f523889cFd878';

  const chainId = 80001;

  const network = 'polygon-mumbai';

  const query = {
    schema: schema,
    claimPathKey: schemaClaimPathKey,
    operator: Operators.LT,
    slotIndex: slotIndex,
    value: value,
    queryHash: calculateQueryHash(
      value,
      schema,
      slotIndex,
      Operators.LT,
      schemaClaimPathKey,
      claimPathDoesntExist
    ).toString(),
    circuitIds: [circuitIdSig],
    allowedIssuers: [],
    skipClaimRevocationCheck: false,
    claimPathNotExists: claimPathDoesntExist
  };

  const requestIdSig = await erc1155instance.TRANSFER_REQUEST_ID_SIG_VALIDATOR();

  const invokeRequestMetadata = {
    id: '7f38a193-0918-4a48-9fac-36adfdb8b542',
    typ: 'application/iden3comm-plain-json',
    type: 'https://iden3-communication.io/proofs/1.0/contract-invoke-request',
    thid: '7f38a193-0918-4a48-9fac-36adfdb8b542',
    body: {
      reason: 'for testing',
      transaction_data: {
        contract_address: erc1155instance.address,
        method_id: 'b68967e2',
        chain_id: chainId,
        network: network
      },
      scope: [
        {
          id: requestIdSig,
          circuitId: circuitIdSig,
          query: {
            allowedIssuers: ['*'],
            context: schemaUrl,
            credentialSubject: {
              birthday: {
                $lt: value[0]
              }
            },
            type: type
          }
        }
      ]
    }
  };

  try {
    const txSig = await erc1155instance.setZKPRequest(requestIdSig, {
      metadata: JSON.stringify(invokeRequestMetadata),
      validator: validatorAddressSig,
      data: packValidatorParams(query)
    });
    await txSig.wait();
  } catch (e) {
    console.log('error: ', e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });