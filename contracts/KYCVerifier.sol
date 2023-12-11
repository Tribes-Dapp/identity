// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {ERC1155} from '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import {PrimitiveTypeUtils} from '@iden3/contracts/lib/PrimitiveTypeUtils.sol';
import {ICircuitValidator} from '@iden3/contracts/interfaces/ICircuitValidator.sol';
import {ZKPVerifier} from '@iden3/contracts/verifiers/ZKPVerifier.sol';

contract KYCVerifier is ERC1155, ZKPVerifier {
    uint64 public constant TRANSFER_REQUEST_ID_SIG_VALIDATOR = 1;
    uint64 public constant TRANSFER_REQUEST_ID_MTP_VALIDATOR = 2;

    event Verified(uint64 indexed requestId, uint256 indexed id, address indexed addr);

    constructor() ERC1155("") {}

    function _beforeProofSubmit(
        uint64, /* requestId */
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal view override {
        // check that challenge input is address of sender
        address addr = PrimitiveTypeUtils.int256ToAddress(inputs[validator.inputIndexOf('challenge')]);
        // this is linking between msg.sender and
        require(_msgSender() == addr, 'address in proof is not a sender address');
    }

    function _afterProofSubmit(
        uint64 requestId,
        uint256[] memory inputs,
        ICircuitValidator /*validator*/
    ) internal override {
        if (requestId == TRANSFER_REQUEST_ID_SIG_VALIDATOR || requestId == TRANSFER_REQUEST_ID_MTP_VALIDATOR ){
            // if proof is given for transfer request id ( mtp or sig ) and it's a first time we mint tokens to sender
            uint256 id = inputs[1];
            emit Verified(requestId, id, _msgSender());
            // if (idToAddress[id] == address(0) && addressToId[_msgSender()] == 0) {
            //     super._mint(_msgSender(), TOKEN_AMOUNT_FOR_AIRDROP_PER_ID);
            //     addressToId[_msgSender()] = id;
            //     idToAddress[id] = _msgSender();
            // }
        }
    }

}
