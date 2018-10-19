#!/bin/bash

export FABRIC_CFG_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $FABRIC_CFG_PATH

CONFIG_DIR="./config"
CRYPTO_CONFIG_DIR="./crypto-config"
STORAGE_DIR="./storage-volumes"

PUBLIC_CHANNEL_NAME="public"
PUBLIC_CHANNEL_PROFILE="PublicChannel"

# remove previous crypto material and config transactions
rm -rf $CONFIG_DIR
rm -rf $CRYPTO_CONFIG_DIR
rm -rf $STORAGE_DIR

mkdir $CONFIG_DIR
mkdir $CRYPTO_CONFIG_DIR

function generateChannel() {
    channelProfile="${1}"
    channelName="${2}"
    
    configtxgen -profile "$channelProfile" -outputCreateChannelTx "${CONFIG_DIR}/${channelName}_channel.tx" -channelID "$channelName"
    if [ "$?" -ne 0 ]; then
	echo "Failed to generate channel configuration transaction..."
	exit 1
    fi
}

function generateAnchorPeer() {
    channelProfile="${1}"
    channelName="${2}"
    organizationID="${3}"

    configtxgen -profile "$channelProfile" -outputAnchorPeersUpdate "${CONFIG_DIR}/${organizationID}_${channelName}_anchors.tx" -channelID "$channelName" -asOrg "$organizationID"
    if [ "$?" -ne 0 ]; then
	echo "Failed to generate anchor peer update for ${channelName}_${organizationID}..."
	exit 1
    fi
}

# generate crypto material
cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
  echo "Failed to generate crypto material..."
  exit 1
fi

# generate genesis block for orderer
configtxgen -profile OrdererGenesis -outputBlock "$CONFIG_DIR"/genesis.block
if [ "$?" -ne 0 ]; then
  echo "Failed to generate orderer genesis block..."
  exit 1
fi

# generate channels configuration transaction
generateChannel "$PUBLIC_CHANNEL_PROFILE" "$PUBLIC_CHANNEL_NAME"

for i in `seq 0 1`
do
    generateAnchorPeer "$PUBLIC_CHANNEL_PROFILE" "$PUBLIC_CHANNEL_NAME" "Org${i}"
done

