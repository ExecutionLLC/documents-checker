package main

import (
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
	
	SCHEMA_CONTAINER = "SCHEMA_CONTAINER"
	DOCUMENT_CONTAINER = "DOCUMENT_CONTAINER"
	DOCUMENT_ID_PART = "DOCUMENT_ID_PART"
	DOCUMENT_DYNAMIC_PART = "DOCUMENT_DYNAMIC_PART"

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

type SchemaContainerPartField struct{
	JSONschema map[string]interface{} `json:"jsonSchema"`
	UIschema map[string]interface{} `json:"uiSchema"`
}

type SchemaContainer struct{
	IDpart SchemaContainerPartField `json:"idPart"`
	DataPart SchemaContainerPartField `json:"dataPart"`
	DynamicPart SchemaContainerPartField `json:"dynamicPart"`
}

type DocumentContainer struct{
	IDpart map[string]interface{} `json:"idPart"`
	DataPart map[string]interface{} `json:"dataPart"`
	DynamicPart map[string]interface{} `json:"dynamicPart"`
	DataPartTxID string `json:"dataPartTxId"`
	DynamicPartTxID string `json:"dynamicPartTxId"`
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
	case "updateDocumentDynamicPart":
		return dc.updateDocumentDynamicPart(APIstub, functionArgs, transientMap)
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
	schemaIDpartLoader := gojsonschema.NewGoLoader(schemaContainer.IDpart.JSONschema)
	if _, err := gojsonschema.NewSchema(schemaIDpartLoader); err != nil {
		return errors.New(fmt.Sprintf("Cannot load schema of id part: %s", err))
	}
	schemaDataPartLoader := gojsonschema.NewGoLoader(schemaContainer.DataPart.JSONschema)
	if _, err := gojsonschema.NewSchema(schemaDataPartLoader); err != nil {
		return errors.New(fmt.Sprintf("Cannot load schema of data part: %s", err))
	}
	
	return nil
}

func (dc *DocumentsChecker) getSchemaKey(APIstub shim.ChaincodeStubInterface, schemaID string) (string, error) {
	return APIstub.CreateCompositeKey(SCHEMA_COMPOSITE_KEY, []string{SCHEMA_DATA_TYPE, schemaID})
}

func (dc *DocumentsChecker) getDocumentKey(APIstub shim.ChaincodeStubInterface, schemaID string, documentIDpart map[string]interface{}) (string, error) {
	hashOfIDpart, err := getDocumentHash(documentIDpart)
	if err != nil {
		return "", err
	}
	return APIstub.CreateCompositeKey(DOCUMENT_COMPOSITE_KEY, []string{DOCUMENT_DATA_TYPE, schemaID, hashOfIDpart})
}

func (dc *DocumentsChecker) getDocumentKeyByRawData(APIstub shim.ChaincodeStubInterface, schemaID string, documentIDpartAsBytes []byte) (string, error) {
	var documentIDpart map[string]interface{}
	err := json.Unmarshal(documentIDpartAsBytes, &documentIDpart)
	if err != nil {
		return "", errors.New(fmt.Sprintf("Cannot unpack ID part of document: %s", err))
	}
	return dc.getDocumentKey(APIstub, schemaID, documentIDpart)
}

func (dc *DocumentsChecker) createSchema(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]

	privateKey, in := transientMap[SCHEMA_PRIVATE_KEY]
	if !in {
		return shim.Error(fmt.Sprintf("Expected private key (%s)", SCHEMA_PRIVATE_KEY))
	}
	initVec, in := transientMap[IV]
	if !in {
		return shim.Error(fmt.Sprintf("Expected encrypter initialization vector (%s)", IV))
	}
	// Extract schema container
	schemaContainerAsBytes, in := transientMap[SCHEMA_CONTAINER]
	if !in {
		return shim.Error(fmt.Sprintf("Expected schema (%s)", SCHEMA_CONTAINER))
	}
	var schemaContainer SchemaContainer
	err := json.Unmarshal(schemaContainerAsBytes, &schemaContainer)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unpack schema: %s", err))
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

func (dc *DocumentsChecker) readSchemaContainerAsBytes(APIstub shim.ChaincodeStubInterface, schemaID string, privateKey []byte) ([]byte, error) {
	encrypter, err := dc.getSchemaEncrypter(privateKey, nil)
	if err != nil {
		return nil, err
	}
	key, err := dc.getSchemaKey(APIstub, schemaID)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Cannot get schema key: %s", err))
	}
	return getStateAndDecrypt(APIstub, encrypter, key)
}

func (dc *DocumentsChecker) readSchemaContainer(APIstub shim.ChaincodeStubInterface, schemaID string, privateKey []byte) (SchemaContainer, error) {
	var schemaContainer SchemaContainer
	schemaContainerAsBytes, err := dc.readSchemaContainerAsBytes(APIstub, schemaID, privateKey)
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

	schemaContainerAsBytes, err := dc.readSchemaContainerAsBytes(APIstub, schemaID, privateKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return shim.Success(schemaContainerAsBytes)
}

func (dc *DocumentsChecker) isSchemaExists(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]

	key, err := dc.getSchemaKey(APIstub, schemaID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get schema key: %s", err))
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

func (dc *DocumentsChecker) deleteSchema(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	return shim.Error(fmt.Sprintf("deleteSchema is not implimented."))
}

func (dc *DocumentsChecker) checkDataBySchema(schemaAsMap map[string]interface{}, dataAsMap map[string]interface{}) error {
	schemaLoader := gojsonschema.NewGoLoader(schemaAsMap)
	schema, err := gojsonschema.NewSchema(schemaLoader)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot load schema: %s", err))
	}
	dataLoader := gojsonschema.NewGoLoader(dataAsMap)
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
	documentContainerAsBytes, in := transientMap[DOCUMENT_CONTAINER]
	if !in {
		return shim.Error(fmt.Sprintf("Expected document (%s)", DOCUMENT_CONTAINER))
	}
	var documentContainer DocumentContainer
	err := json.Unmarshal(documentContainerAsBytes, &documentContainer)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unpack document: %s", err))
	}

	documentKey, err := dc.getDocumentKey(APIstub, schemaID, documentContainer.IDpart)
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
	err = dc.checkDataBySchema(schemaContainer.IDpart.JSONschema, documentContainer.IDpart)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = dc.checkDataBySchema(schemaContainer.DataPart.JSONschema, documentContainer.DataPart)
	if err != nil {
		return shim.Error(err.Error())
	}
	documentContainer.DataPartTxID = APIstub.GetTxID()
	documentContainerAsBytes, err = json.Marshal(documentContainer)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot pack document: %s", err))
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

	documentPrivateKey, in := transientMap[DOCUMENT_PRIVATE_KEY]
	if !in {
		return shim.Error(fmt.Sprintf("Expected private key (%s)", DOCUMENT_PRIVATE_KEY))
	}
	documentIDpartAsBytes, in := transientMap[DOCUMENT_ID_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected ID part of document (%s)", DOCUMENT_ID_PART))
	}

	key, err := dc.getDocumentKeyByRawData(APIstub, schemaID, documentIDpartAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get document key: %s", err))
	}
	encrypter, err := dc.getDocumentEncrypter(documentPrivateKey, nil)
	if err != nil {
		return shim.Error(err.Error())
	}
        documentContainerAsBytes, err := getStateAndDecrypt(APIstub, encrypter, key)
        if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get state: %s", err))
	}

	return shim.Success(documentContainerAsBytes)
}

func (dc *DocumentsChecker) isDocumentExists(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]
	
	documentIDpartAsBytes, in := transientMap[DOCUMENT_ID_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected ID part of document (%s)", DOCUMENT_ID_PART))
	}

	key, err := dc.getDocumentKeyByRawData(APIstub, schemaID, documentIDpartAsBytes)
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

func (dc *DocumentsChecker) updateDocumentDynamicPart(APIstub shim.ChaincodeStubInterface, args []string, transientMap map[string][]byte) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	schemaID := args[0]

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

	documentIDpartAsBytes, in := transientMap[DOCUMENT_ID_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected ID part of document (%s)", DOCUMENT_ID_PART))
	}
	documentDynamicPartAsBytes, in := transientMap[DOCUMENT_DYNAMIC_PART]
	if !in {
		return shim.Error(fmt.Sprintf("Expected dynamic part of document (%s)", DOCUMENT_DYNAMIC_PART))
	}

	key, err := dc.getDocumentKeyByRawData(APIstub, schemaID, documentIDpartAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get document key: %s", err))
	}
	encrypter, err := dc.getDocumentEncrypter(documentPrivateKey, initVec)
	if err != nil {
		return shim.Error(err.Error())
	}
        documentContainerAsBytes, err := getStateAndDecrypt(APIstub, encrypter, key)
        if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get state: %s", err))
	}
	var documentDynamicPart map[string]interface{}
	err = json.Unmarshal(documentDynamicPartAsBytes, &documentDynamicPart)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unpack dynamic part of document: %s", err))
	}
	var documentContainer DocumentContainer
	err = json.Unmarshal(documentContainerAsBytes, &documentContainer)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unpack document: %s", err))
	}
	documentContainer.DynamicPart = documentDynamicPart
	schemaContainer, err := dc.readSchemaContainer(APIstub, schemaID, schemaPrivateKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = dc.checkDataBySchema(schemaContainer.DynamicPart.JSONschema, documentContainer.DynamicPart)
	if err != nil {
		return shim.Error(err.Error())
	}
	documentContainer.DynamicPartTxID = APIstub.GetTxID()
	documentContainerAsBytes, err = json.Marshal(documentContainer)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot pack document: %s", err))
	}
	err = encryptAndPutState(APIstub, encrypter, key, documentContainerAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot save document container: %s", err))
	}

	return shim.Success(nil)
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
