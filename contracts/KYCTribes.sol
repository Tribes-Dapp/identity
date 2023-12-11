// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IInputBox} from '@cartesi/contracts/inputs/IInputBox.sol';
import {ZKPVerifier} from '@iden3/contracts/verifiers/ZKPVerifier.sol';
import {PrimitiveTypeUtils} from '@iden3/contracts/lib/PrimitiveTypeUtils.sol';
import {ICircuitValidator} from '@iden3/contracts/interfaces/ICircuitValidator.sol';

contract KYCTribes is ZKPVerifier {
    address public dapp;
    address public inputBox;

    uint64 public constant KYC_TRIBES_ID_SIG_VALIDATOR = 1;

    event ProofMatch(uint64 indexed requestId, address indexed addr);
    event KYCVerificationCompleted(
        uint64 indexed requestId,
        address indexed addr
    );

    error ProofDoesNotMatch(uint64 requestId, address addr);
    error KYCVerificationFailed(uint64 requestId, address addr);

    constructor(address _dapp, address _inputBox) {
        dapp = _dapp;
        inputBox = _inputBox;
    }

    function _beforeProofSubmit(
        uint64 requestId,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal override {
        address addr = PrimitiveTypeUtils.int256ToAddress(
            inputs[validator.inputIndexOf('challenge')]
        );
        if (_msgSender() != addr) {
            revert ProofDoesNotMatch(requestId, addr);
        } else {
            emit ProofMatch(requestId, addr);
        }
    }

    function _afterProofSubmit(
        uint64 requestId,
        uint256[] memory, /*inputs*/
        ICircuitValidator /*validator*/
    ) internal override {
        if (requestId == KYC_TRIBES_ID_SIG_VALIDATOR) {
            IInputBox(inputBox).addInput(dapp, abi.encodePacked(_msgSender()));
            emit KYCVerificationCompleted(requestId, _msgSender());
        } else {
            revert KYCVerificationFailed(requestId, _msgSender());
        }
    }
}
