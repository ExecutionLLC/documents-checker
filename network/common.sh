#!/bin/bash

# CLI config
CLI_CORE_PEER_LOCALMSPID="Org0MSP"
CLI_CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org0.private.net/users/Admin@org0.private.net/msp"

# channels
PUBLIC_CHANNEL_NAME="public"
PRIVATE_0_CHANNEL_NAME="private0"
PRIVATE_1_CHANNEL_NAME="private1"

ORDERER_URL="orderer.private.net:7050"
CLI_CONTAINER="cli.private.net"

execPeerCommand()
{
    orgNumber="${1}"; shift
    peerNumber="${1}"; shift

    peerContainer="peer${peerNumber}.org${orgNumber}.private.net"
    envLocalMspId="CORE_PEER_LOCALMSPID=Org${orgNumber}MSP"
    envMspConfigPath="CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org${orgNumber}.private.net/msp"

    docker exec -e "$envLocalMspId" -e "$envMspConfigPath" "$peerContainer" "$@"
}

execCliCommand()
{
    docker exec -e "CORE_PEER_LOCALMSPID=${CLI_CORE_PEER_LOCALMSPID}" -e "CORE_PEER_MSPCONFIGPATH=${CLI_CORE_PEER_MSPCONFIGPATH}" "$CLI_CONTAINER" "$@"
}

deployChaincode()
{
    channelName="${1}"
    chaincodeName="${2}"
    
    execCliCommand "peer" "chaincode" "install" "-n" "$chaincodeName" "-v" "1.0" "-p" "github.com/documents-checker"
    execCliCommand "peer" "chaincode" "instantiate" "-o" "$ORDERER_URL" "-C" "$channelName" "-n" "$chaincodeName" "-v" "1.0" "-c" "{\"Args\":[\"\"]}"
}

chaincodeQuery()
{
    channelName="${1}"
    chaincodeName="${2}"
    commonArgs="${3}"
    transientArgs="${4}"

    cmdArgs=(
	"peer"
	"chaincode"
	"query"
	"-C"
	"$channelName"
	"-n"
	"$chaincodeName"
	"-c"
	"$commonArgs"
    )
    if [ "$transientArgs" ]
    then
	cmdArgs+=(
	    "--transient"
	    "$transientArgs"
	)
    fi
    execCliCommand "${cmdArgs[@]}"
}

chaincodeInvoke()
{
    channelName="${1}"
    chaincodeName="${2}"
    commonArgs="${3}"
    transientArgs="${4}"

    cmdArgs=(
	"peer"
	"chaincode"
	"invoke"
	"-o"
	"$ORDERER_URL"
	"-C"
	"$channelName"
	"-n"
	"$chaincodeName"
	"-c"
	"$commonArgs"
    )
    if [ "$transientArgs" ]
    then
	cmdArgs+=(
	    "--transient"
	    "$transientArgs"
	)
    fi
    execCliCommand "${cmdArgs[@]}"
}
