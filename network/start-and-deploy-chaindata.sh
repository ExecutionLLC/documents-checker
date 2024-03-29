#!/bin/bash

set -e

./stop-and-remove-chaindata.sh

echo "STARTING DOCKER CONTAINERS"
docker-compose -f docker-compose.yml up -d
# ca.private.net orderer.execution.su peer0.lotterystand1 cli.lotterystand1

# wait for Hyperledger Fabric to start
echo "WAITING HYPERLEDGER FABRIC"
sleep 10

source ./common.sh

execPeerCommand "0" "0" "peer" "channel" "create" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/${PUBLIC_CHANNEL_NAME}_channel.tx"
execPeerCommand "0" "0" "peer" "channel" "join" "-b" "${PUBLIC_CHANNEL_NAME}.block"

execPeerCommand "0" "0" "peer" "channel" "create" "-o" "$ORDERER_URL" "-c" "$PRIVATE_0_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/${PRIVATE_0_CHANNEL_NAME}_channel.tx"
execPeerCommand "0" "0" "peer" "channel" "join" "-b" "${PRIVATE_0_CHANNEL_NAME}.block"

execPeerCommand "2" "0" "peer" "channel" "create" "-o" "$ORDERER_URL" "-c" "$PRIVATE_1_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/${PRIVATE_1_CHANNEL_NAME}_channel.tx"
execPeerCommand "2" "0" "peer" "channel" "join" "-b" "${PRIVATE_1_CHANNEL_NAME}.block"

execPeerCommand "0" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org0_${PUBLIC_CHANNEL_NAME}_anchors.tx"
execPeerCommand "0" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PRIVATE_0_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org0_${PRIVATE_0_CHANNEL_NAME}_anchors.tx"

execPeerCommand "1" "0" "peer" "channel" "fetch" "0" "${PUBLIC_CHANNEL_NAME}.block" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME"
execPeerCommand "1" "0" "peer" "channel" "join" "-b" "${PUBLIC_CHANNEL_NAME}.block"

execPeerCommand "1" "0" "peer" "channel" "fetch" "0" "${PRIVATE_0_CHANNEL_NAME}.block" "-o" "$ORDERER_URL" "-c" "$PRIVATE_0_CHANNEL_NAME"
execPeerCommand "1" "0" "peer" "channel" "join" "-b" "${PRIVATE_0_CHANNEL_NAME}.block"

execPeerCommand "2" "0" "peer" "channel" "fetch" "0" "${PUBLIC_CHANNEL_NAME}.block" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME"
execPeerCommand "2" "0" "peer" "channel" "join" "-b" "${PUBLIC_CHANNEL_NAME}.block"

execPeerCommand "3" "0" "peer" "channel" "fetch" "0" "${PUBLIC_CHANNEL_NAME}.block" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME"
execPeerCommand "3" "0" "peer" "channel" "join" "-b" "${PUBLIC_CHANNEL_NAME}.block"

execPeerCommand "3" "0" "peer" "channel" "fetch" "0" "${PRIVATE_1_CHANNEL_NAME}.block" "-o" "$ORDERER_URL" "-c" "$PRIVATE_1_CHANNEL_NAME"
execPeerCommand "3" "0" "peer" "channel" "join" "-b" "${PRIVATE_1_CHANNEL_NAME}.block"

execPeerCommand "1" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org1_${PUBLIC_CHANNEL_NAME}_anchors.tx"
execPeerCommand "1" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PRIVATE_0_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org1_${PRIVATE_0_CHANNEL_NAME}_anchors.tx"

execPeerCommand "2" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org2_${PUBLIC_CHANNEL_NAME}_anchors.tx"
execPeerCommand "2" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PRIVATE_1_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org2_${PRIVATE_1_CHANNEL_NAME}_anchors.tx"

execPeerCommand "3" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org3_${PUBLIC_CHANNEL_NAME}_anchors.tx"
execPeerCommand "3" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PRIVATE_1_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org3_${PRIVATE_1_CHANNEL_NAME}_anchors.tx"

deployChaincode "$PUBLIC_CHANNEL_NAME" "documents_checker_public"

