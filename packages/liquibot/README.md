## Liquibot

Implementation of a naive liquidation bot for the liquity protocol.

Unlikely to be profitable. Currently listens to new block events from an online RPC provider -- introduces high latency. Does not implement gas price auction functionality, instead blanket bids a 133% gas price.

Naive proof of concept -- a better approach would likely be listening to alpha-generating transactions/events in the mempool instead of listening to new blocks.
