package main

import (
	"crypto/sha512"
	"encoding/base64"
	"errors"
	
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/core/chaincode/shim/ext/entities"
)

func getDocumentHash(document []byte) string {
	hash := sha512.Sum512(document)
	return base64.StdEncoding.EncodeToString(hash[:])
}

func getStateAndDecrypt(APIstub shim.ChaincodeStubInterface, encrypter entities.Encrypter, key string) ([]byte, error) {
	cypherValue, err := APIstub.GetState(key)
	if err != nil {
		return nil, err
	}

	if cypherValue == nil {
		return nil, errors.New("Key does not found")
	}

	if len(cypherValue) == 0 {
		return nil, errors.New("cypherValue is empty")
	}

	return encrypter.Decrypt(cypherValue)
}

func getStateDecryptAndVerify(APIstub shim.ChaincodeStubInterface, encrypterSigner entities.EncrypterSignerEntity, key string) ([]byte, error) {
	value, err := getStateAndDecrypt(APIstub, encrypterSigner, key)
	if err != nil {
		return nil, err
	}

	var message entities.SignedMessage
	err = message.FromBytes(value)
	if err != nil {
		return nil, err
	}
	ok, err := message.Verify(encrypterSigner)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, errors.New("Invalid signature")
	}

	return message.Payload, nil
}

func encryptAndPutState(APIstub shim.ChaincodeStubInterface, encrypter entities.Encrypter, key string, value []byte) error {
	cypherValue, err := encrypter.Encrypt(value)
	if err != nil {
		return err
	}
	
	return APIstub.PutState(key, cypherValue)
}

func signEncryptAndPutState(APIstub shim.ChaincodeStubInterface, encrypterSigner entities.EncrypterSignerEntity, key string, value []byte) error {
	message := entities.SignedMessage{
		ID: []byte(encrypterSigner.ID()),
		Payload: value,
	}
	err := message.Sign(encrypterSigner)
	if err != nil {
		return err
	}

	messageBytes, err := message.ToBytes()
	if err != nil {
		return err
	}

	return encryptAndPutState(APIstub, encrypterSigner, key, messageBytes)
}
