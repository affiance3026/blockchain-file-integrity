// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {

    struct File {
        string fileHash;
        uint timestamp;
    }

    mapping(string => File) public files;

    // Store file hash
    function storeFile(string memory fileId, string memory hash) public {
        files[fileId] = File(hash, block.timestamp);
    }

    // Get file hash
    function getFile(string memory fileId) public view returns(string memory, uint) {
        return (files[fileId].fileHash, files[fileId].timestamp);
    }
}