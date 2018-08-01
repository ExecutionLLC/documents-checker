#!/bin/bash

source ./common.sh

SCHEMA_ID="test_schema"
SCHEMA_CONTAINER='{"idPart":{"jsonSchema":{"title":"test_id","type":"object","properties":{"id":{"type":"string"}},"required":["id"]},"uiSchema":{}},"dataPart":{"jsonSchema":{"title":"test_data","type":"object","properties":{"data":{"type":"string"}},"required":["data"]},"uiSchema":{}}}'

DOCUMENT_ID_PART='{"id":"test document"}'
DOCUMENT_DATA_PART='{"data":"test data"}'
DOCUMENT_CONTAINER="{\"idPart\":$DOCUMENT_ID_PART,\"dataPart\":$DOCUMENT_DATA_PART}"

SCHEMA_CONTAINER_B64=$(echo "$SCHEMA_CONTAINER" | base64 -w 0)
DOCUMENT_ID_PART_B64=$(echo "$DOCUMENT_ID_PART" | base64 -w 0)
DOCUMENT_CONTAINER_B64=$(echo "$DOCUMENT_CONTAINER" | base64 -w 0)

PRIVATE_KEY_0="5gS/gVxbfwx/i3sKNdv0HEoELdCXj1Sw1ADcOEuLqwY="
PRIVATE_KEY_1="Oo32Wk5kZ3/FTeG8nvx2jK/dRXiwA2huR0ogF+fMgDc="
IV="toXjStqIapFvDV0Zk7Ls+g=="

invokeCommonArgs0="{\"Args\":[\"createSchema\",\"$SCHEMA_ID\"]}"
invokeTransientArgs0="{\"SCHEMA_CONTAINER\":\"$SCHEMA_CONTAINER_B64\",\"SCHEMA_PRIVATE_KEY\":\"$PRIVATE_KEY_0\",\"IV\":\"$IV\"}"
chaincodeInvoke "$PUBLIC_CHANNEL_NAME" "documents_checker_public" "$invokeCommonArgs0" "$invokeTransientArgs0"

sleep 3

queryCommonArgs0="{\"Args\":[\"readSchema\",\"$SCHEMA_ID\"]}"
queryTransientArgs0="{\"SCHEMA_PRIVATE_KEY\":\"$PRIVATE_KEY_0\"}"
chaincodeQuery "$PUBLIC_CHANNEL_NAME" "documents_checker_public" "$queryCommonArgs0" "$queryTransientArgs0"

invokeCommonArgs1="{\"Args\":[\"createDocument\",\"$SCHEMA_ID\"]}"
invokeTransientArgs1="{\"DOCUMENT_CONTAINER\":\"$DOCUMENT_CONTAINER_B64\",\"SCHEMA_PRIVATE_KEY\":\"$PRIVATE_KEY_0\",\"DOCUMENT_PRIVATE_KEY\":\"$PRIVATE_KEY_1\",\"IV\":\"$IV\"}"
chaincodeInvoke "$PUBLIC_CHANNEL_NAME" "documents_checker_public" "$invokeCommonArgs1" "$invokeTransientArgs1"

sleep 3

queryCommonArgs1="{\"Args\":[\"isDocumentExists\",\"$SCHEMA_ID\"]}"
queryTransientArgs1="{\"DOCUMENT_ID_PART\":\"$DOCUMENT_ID_PART_B64\"}"
chaincodeQuery "$PUBLIC_CHANNEL_NAME" "documents_checker_public" "$queryCommonArgs1" "$queryTransientArgs1"

queryCommonArgs2="{\"Args\":[\"readDocument\",\"$SCHEMA_ID\"]}"
queryTransientArgs2="{\"DOCUMENT_ID_PART\":\"$DOCUMENT_ID_PART_B64\",\"DOCUMENT_PRIVATE_KEY\":\"$PRIVATE_KEY_1\"}"
chaincodeQuery "$PUBLIC_CHANNEL_NAME" "documents_checker_public" "$queryCommonArgs2" "$queryTransientArgs2"
