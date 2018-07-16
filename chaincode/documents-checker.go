package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric/bccsp"
	"github.com/hyperledger/fabric/bccsp/factory"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/core/chaincode/shim/ext/entities"
	pb "github.com/hyperledger/fabric/protos/peer"

	"github.com/xeipuuv/gojsonschema"
)

const (
	SCHEMA_ID = "SCHEMA_ID"
	
	SCHEMA_ID_PART = "SCHEMA_ID_PART"
	SCHEMA_DATA_PART = "SCHEMA_DATA_PART"
	DOCUMENT_ID_PART = "DOCUMENT_ID_PART"
	DOCUMENT_DATA_PART = "DOCUMENT_DATA_PART"

	SCHEMA_PRIVATE_KEY = "SCHEMA_PRIVATE_KEY"
	DOCUMENT_PRIVATE_KEY = "DOCUMENT_PRIVATE_KEY"
	SIGNER_PUBLIC_KEY = "SIGNER_PUBLIC_KEY"
	SIGNER_PRIVATE_KEY = "SIGNER_PRIVATE_KEY"
	IV = "IV"

	SCHEMA_ENCRYPTER_ID = "SCHEMA_ENCRYPTER_ID"
	DOCUMENT_ENCRYPTER_ID = "DOCUMENT_ENCRYPTER_ID"

	SCHEMA_COMPOSITE_KEY = "dataType~schemaId"
	DOCUMENT_COMPOSITE_KEY = "dataType~schemaId~documentId"
	SCHEMA_DATA_TYPE = "SCHEMA"
	DOCUMENT_DATA_TYPE = "DOCUMENT"
)

type SchemaContainer struct{
	IDpart []byte `json:idPart`
	DataPart []byte `json:dataPart`
}

type DocumentContainer struct{
	IDpart []byte `json:idPart`
	DataPart []byte `json:dataPart`
	HashOfDataPart string `json:hashOfDataPart`
}

type DocumentsChecker struct {
	bccspInst bccsp.BCCSP
}

func (dc *DocumentsChecker) Init(APIstub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

func (dc *DocumentsChecker) Invoke(APIstub shim.ChaincodeStubInterface) pb.Response {
	// get arguments and transient
	functionName, functionArgs := APIstub.GetFunctionAndParameters()
	transientMap, err := APIstub.GetTransient()
	if err != nil {
		return shim.Error(fmt.Sprintf("Could not retrieve transient, err %s", err))
	}

	switch functionName {
	case "createSchema":
		return dc.createSchema(APIstub, functionArgs, transientMap)
	case "readSchema":
		return dc.readSchema(APIstub, functionArgs, transientMap)
	case "isSchemaExists":
		return dc.isSchemaExists(APIstub, functionArgs, transientMap)
	case "deleteSchema":
		return dc.deleteSchema(APIstub, functionArgs, transientMap)

	case "createDocument":
		return dc.createDocument(APIstub, functionArgs, transientMap)
	case "readDocument":
		return dc.readDocument(APIstub, functionArgs, transientMap)
	case "isDocumentExists":
		return dc.isDocumentExists(APIstub, functionArgs, transientMap)
	case "deleteDocument":
		return dc.deleteDocument(APIstub, functionArgs, transientMap)
	}

	return shim.Error(fmt.Sprintf("Got unknown function name (%s).", functionName))
}

func (dc *DocumentsChecker) getSchemaEncrypter(privateKey []byte, initVec []byte) (entities.Encrypter, error) {
	return entities.NewAES256EncrypterEntity(SCHEMA_ENCRYPTER_ID, dc.bccspInst, privateKey, initVec)
}

func (dc *DocumentsChecker) getDocumentEncrypter(privateKey []byte, initVec []byte) (entities.Encrypter, error) {
	return entities.NewAES256EncrypterEntity(DOCUMENT_ENCRYPTER_ID, dc.bccspInst, privateKey, initVec)
}

func (dc *DocumentsChecker) checkSchemasInContainer(schemaContainer SchemaContainer) error {
	schemaIDpartLoader := gojsonschema.NewBytesLoader(schemaContainer.IDpart)
	if _, err := gojsonschema.NewSchema(schemaIDpartLoader); err != nil {
		return errors.New(fmt.Sprintf("Cannot load schema of id part: %s", err))
	}
	schemaDataPartLoader := gojsonschema.NewBytesLoader(schemaContainer.DataPart)
	if _, err := gojsonschema.NewSchema(schemaDataPartLoader); err != nil {
		return errors.New(fmt.Sprintf("Cannot load schema of data part: %s", err))
	}
	
	return nil
}

func (dc *DocumentsChecker) getSchemaKey(APIstub shim.ChaincodeStubInterface, schemaID string) (string, error) {
	return APIstub.CreateCompositeKey(SCHEMA_COMPOSITE_KEY, []string{SCHEMA_DATA_TYPE, schemaID})
}

func (dc *DocumentsChecker) getDocumentKey(APIstub shim.ChaincodeStubInterface, schemaID string, documentIDpartAsBytes []byte) (string, error) {
	hashOfIDpart := getDocumentHash(documentIDpartAsBytes)
	return APIstub.CreateCompositeKey(DOCUMENT_COMPOSITE_KEY, []string{DOCUMENT_DATA_TYPE, schemaID, hashOfIDpart})
}

func (dc *DocumentsChecker) createSchema(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]

	schemaIDpartAsBytes, in := transientMap[SCHEMA_ID_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected schema (%s)", SCHEMA_ID_PART))
	}
	schemaDataPartAsBytes, in := transientMap[SCHEMA_DATA_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected schema (%s)", SCHEMA_DATA_PART))
	}
	privateKey, in := transientMap[SCHEMA_PRIVATE_KEY]
	if !in {
		return shim.Error(fmt.Sprintf("Expected private key (%s)", SCHEMA_PRIVATE_KEY))
	}
	initVec, in := transientMap[IV]
	if !in {
		return shim.Error(fmt.Sprintf("Expected encrypter initialization vector (%s)", IV))
	}

	schemaContainer := SchemaContainer{
		IDpart: schemaIDpartAsBytes,
		DataPart: schemaDataPartAsBytes,
	}
	schemaContainerAsBytes, err := json.Marshal(&schemaContainer)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot pack schema: %s", err))
	}
	err = dc.checkSchemasInContainer(schemaContainer)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := dc.getSchemaKey(APIstub, schemaID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get schema key: %s", err))
	}
	value, err := APIstub.GetState(key)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get state: %s", err))
	}
	if value != nil {
		return shim.Error("Schema already exists")
	}
	encrypter, err := dc.getSchemaEncrypter(privateKey, initVec)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = encryptAndPutState(APIstub, encrypter, key, schemaContainerAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return shim.Success(nil)
}

func (dc *DocumentsChecker) readSchemaContainer(APIstub shim.ChaincodeStubInterface, schemaID string, privateKey []byte) (SchemaContainer, error) {
	var schemaContainer SchemaContainer
	encrypter, err := dc.getSchemaEncrypter(privateKey, nil)
	if err != nil {
		return schemaContainer, err
	}
	key, err := dc.getSchemaKey(APIstub, schemaID)
	if err != nil {
		return schemaContainer, errors.New(fmt.Sprintf("Cannot get schema key: %s", err))
	}
	schemaContainerAsBytes, err := getStateAndDecrypt(APIstub, encrypter, key)
	if err != nil {
		return schemaContainer, err
	}
	err = json.Unmarshal(schemaContainerAsBytes, &schemaContainer)
	if err != nil {
		return schemaContainer, errors.New(fmt.Sprintf("Cannot unpack schema: %s", err))
	}
	
	return schemaContainer, nil
}

func (dc *DocumentsChecker) readSchema(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]
	
	privateKey, in := transientMap[SCHEMA_PRIVATE_KEY]
	if !in {
		return shim.Error(fmt.Sprintf("Expected private key %s", SCHEMA_PRIVATE_KEY))
	}

	schemaContainer, err := dc.readSchemaContainer(APIstub, schemaID, privateKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	var buffer bytes.Buffer
	buffer.WriteString("{\"idPart\":")
	buffer.Write(schemaContainer.IDpart)
	buffer.WriteString(",")
	buffer.WriteString("\"dataPart\":")
	buffer.Write(schemaContainer.DataPart)
	buffer.WriteString("}")
	
	return shim.Success(buffer.Bytes())
}

func (dc *DocumentsChecker) readSchemaIDpart(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]
	
	privateKey, in := transientMap[SCHEMA_PRIVATE_KEY]
	if !in {
		return shim.Error(fmt.Sprintf("Expected private key %s", SCHEMA_PRIVATE_KEY))
	}

	schemaContainer, err := dc.readSchemaContainer(APIstub, schemaID, privateKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return shim.Success(schemaContainer.IDpart)
}

func (dc *DocumentsChecker) readSchemaDataPart(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]
	
	privateKey, in := transientMap[SCHEMA_PRIVATE_KEY]
	if !in {
		return shim.Error(fmt.Sprintf("Expected private key %s", SCHEMA_PRIVATE_KEY))
	}

	schemaContainer, err := dc.readSchemaContainer(APIstub, schemaID, privateKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return shim.Success(schemaContainer.DataPart)
}

func (dc *DocumentsChecker) isSchemaExists(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	return shim.Error(fmt.Sprintf("isSchemaExists is not implimented."))
}

func (dc *DocumentsChecker) deleteSchema(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	return shim.Error(fmt.Sprintf("deleteSchema is not implimented."))
}

func (dc *DocumentsChecker) checkDataBySchema(schemaAsBytes []byte, dataAsBytes []byte) error {
	schemaLoader := gojsonschema.NewBytesLoader(schemaAsBytes)
	schema, err := gojsonschema.NewSchema(schemaLoader)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot load schema: %s", err))
	}
	dataLoader := gojsonschema.NewBytesLoader(dataAsBytes)
	validationResult, err := schema.Validate(dataLoader)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot check document: %s", err))
	}
	if !validationResult.Valid() {
		return errors.New("Document is not valid")
	}

	return nil
}

func (dc *DocumentsChecker) createDocument(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]
	
	documentIDpartAsBytes, in := transientMap[DOCUMENT_ID_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected document (%s)", DOCUMENT_ID_PART))
	}
	documentDataPartAsBytes, in := transientMap[DOCUMENT_DATA_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected document (%s)", DOCUMENT_DATA_PART))
	}
	schemaPrivateKey, in := transientMap[SCHEMA_PRIVATE_KEY]
	if !in {
		return shim.Error(fmt.Sprintf("Expected schema private key (%s)", SCHEMA_PRIVATE_KEY))
	}
	documentPrivateKey, in := transientMap[DOCUMENT_PRIVATE_KEY]
	if !in {
		return shim.Error(fmt.Sprintf("Expected document private key (%s)", DOCUMENT_PRIVATE_KEY))
	}
	initVec, in := transientMap[IV]
	if !in {
		return shim.Error(fmt.Sprintf("Expected initialization vector (%s)", IV))
	}

	documentKey, err := dc.getDocumentKey(APIstub, schemaID, documentIDpartAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get document key: %s", err))
	}

	cypherValue, err := APIstub.GetState(documentKey)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get state: %s", err))
	}
	if cypherValue != nil {
		return shim.Error("Document already exists")
	}
	
	schemaContainer, err := dc.readSchemaContainer(APIstub, schemaID, schemaPrivateKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	hashOfDataPart := getDocumentHash(documentIDpartAsBytes)
	documentContainer := DocumentContainer{
		IDpart: documentIDpartAsBytes,
		DataPart: documentDataPartAsBytes,
		HashOfDataPart: hashOfDataPart,
	}
	documentContainerAsBytes, err := json.Marshal(&documentContainer)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot pack document: %s", err))
	}
	err = dc.checkDataBySchema(schemaContainer.IDpart, documentContainer.IDpart)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = dc.checkDataBySchema(schemaContainer.DataPart, documentContainer.DataPart)
	if err != nil {
		return shim.Error(err.Error())
	}
	documentEncrypter, err := dc.getDocumentEncrypter(documentPrivateKey, initVec)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = encryptAndPutState(APIstub, documentEncrypter, documentKey, documentContainerAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot save document container: %s", err))
	}

	return shim.Success(nil)
}

func (dc *DocumentsChecker) readDocument(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]

	documentIDpartAsBytes, in := transientMap[DOCUMENT_ID_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected document (%s)", DOCUMENT_ID_PART))
	}
	privateKey, in := transientMap[DOCUMENT_PRIVATE_KEY]
	if !in {
		return shim.Error(fmt.Sprintf("Expected private key (%s)", DOCUMENT_PRIVATE_KEY))
	}

	key, err := dc.getDocumentKey(APIstub, schemaID, documentIDpartAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get document key: %s", err))
	}
	encrypter, err := dc.getDocumentEncrypter(privateKey, nil)
	if err != nil {
		return shim.Error(err.Error())
	}
        documentContainerAsBytes, err := getStateAndDecrypt(APIstub, encrypter, key)
        if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get state: %s", err))
	}
	var documentContainer DocumentContainer
	err = json.Unmarshal(documentContainerAsBytes, &documentContainer)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unpack document: %s", err))
	}

	var buffer bytes.Buffer
	buffer.WriteString("{\"idPart\":")
	buffer.Write(documentContainer.IDpart)
	buffer.WriteString(",")
	buffer.WriteString("\"dataPart\":")
	buffer.Write(documentContainer.DataPart)
	buffer.WriteString("}")
	
	return shim.Success(buffer.Bytes())
}

func (dc *DocumentsChecker) isDocumentExists(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]
	
	documentIDpartAsBytes, in := transientMap[DOCUMENT_ID_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected document (%s)", DOCUMENT_ID_PART))
	}
	key, err := dc.getDocumentKey(APIstub, schemaID, documentIDpartAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get document key: %s", err))
	}
	cypherValue, err := APIstub.GetState(key)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get state: %s", err))
	}

	if cypherValue == nil {
		return shim.Success([]byte("false"))
	}

	return shim.Success([]byte("true"))
}

func (dc *DocumentsChecker) deleteDocument(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	return shim.Error(fmt.Sprintf("deleteDocument is not implimented."))
}

func main() {
	factory.InitFactories(nil)

	err := shim.Start(&DocumentsChecker{factory.GetDefault()})
	if err != nil {
		fmt.Printf("Error starting DocumentsChecker chaincode: %s", err)
	}
}
