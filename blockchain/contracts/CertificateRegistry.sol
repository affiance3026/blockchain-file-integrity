// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {

    struct Certificate {
        string certificate_id;
        string cid;
        string issuer_id;
        string user_id;
    }

    mapping(string => Certificate) public certificates;

    function storeCertificate(
        string memory _certificate_id,
        string memory _cid,
        string memory _issuer_id,
        string memory _user_id
    ) public {

        certificates[_certificate_id] = Certificate(
            _certificate_id,
            _cid,
            _issuer_id,
            _user_id
        );
    }

    function getCertificate(string memory _certificate_id)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        Certificate memory cert = certificates[_certificate_id];

        return (
            cert.certificate_id,
            cert.cid,
            cert.issuer_id,
            cert.user_id
        );
    }
}