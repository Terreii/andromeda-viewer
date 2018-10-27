# Synchronizing

## General

Andromeda uses [Hoodie](https://hood.ie) ([GitHub](https://github.com/hoodiehq)) for the server, accounts and synchronizing of chat logs, avatars and grids.

## Account

An account of the viewer is a hoodie-account. Sign in and out is handled by hoodies account module. Look at the [readme.md](https://github.com/hoodiehq/hoodie-account-client/blob/master/README.md) and [documentation](http://docs.hood.ie/en/latest/api/client/hoodie.account.html) of it.
An account name is always an email-address.

## Store

All data, that will be synchronized, must be stored in hoodies store module. It’s API is documented in its [readme.md](https://github.com/hoodiehq/hoodie-store-client/blob/master/README.md) and [documentation](http://docs.hood.ie/en/latest/api/client/hoodie.store.html).
The store is a NoSQL database based on PouchDB and CouchDB. Data is saved in documents (doc). An doc is a JSON-Object. No Array as base! Every doc has an ID-string (`_id` key) that is unique for a database.
Every user has their own database.

## Encryption

Andormeda uses [hoodie-plugin-store-crypto](https://github.com/Terreii/hoodie-plugin-store-crypto) to encrypt and decrypt user data.
It uses `pbkdf2` with `sha256` to generate a key and `AES-GCM` for data encryption.
The salt is synced, but the encryption password and key are not synchronized!
Because the `_id` can't be encrypted, most data uses some random generated UUIDs in their names.

## Store Layout

Docs are organized with prefixes on their IDs, separated with `/`. View it as folders with JSON-files in it.
Data from an avatar (chats) are stored with an `dataSaveId` as a prefix. This is a random generated UUID unique to that avatar!
- [`avatars/`](#avatars)
- [`grids/`](#grids)
- [`[dataSaveId]/localchat/`](#local-chat)
- [`[dataSaveId]/imChatsInfos/`](#im-chat)
- [`[dataSaveId]/imChats/`](#im-chat)

### Avatars

Avatars are saved under `avatars/` appended by an UUID.

In the doc is stored:

key | description
---|---
`_id` | `avatars/[random generated UUID]`
`dataSaveId` | A random generated UUID, that is used as a prefix for all data of this avatar.
`avatarIdentifier` | The avatar-identifier consist out of the full avatar name, separated by a space then an `@` followed by an grid name. Used to differentiate the avatars. `Tester Resident@OS Grid`.
`name` | Full name of the avatar. Will be displayed on login screen.
`grid` | Name of the grid this avatar belongs to

Future version may save avatar specific settings (like default login position or RLV).

### Grids

Grids are saved under `grids/` appended by an UUID.

In the doc is stored:

key | description
---|---
`_id` | `grids/[random generated UUID`.
`name` | Display name and identifier in the avatar docs.
`loginURL` | URL of the login endpoint.

### Data of an Avatar

Every avatar, that is synced, saves its data under `[dataSaveId]/`. Where dataSaveId is the random generated UUID that is stored in the avatar doc.

Currently only local-chat messages and IM-messages are saved.

#### Local Chat

Local chat messages are saved by messages. Their ID has the structure of `[dataSaveId]/localchat/[JSON-Time]` where JSON-Time is the result of `new Date().toJSON()` (a ISO date/time string `2017-10-27T22:21:01.865Z`).

The local chat doc contains every required data for its chat type. See in the wiki under [ChatFromSimulator](http://wiki.secondlife.com/wiki/ChatFromSimulator) and [ChatFromViewer](http://wiki.secondlife.com/wiki/ChatFromViewer).

#### IM Chat

IMs are saved by message. There are two types of docs for IMs.

Key | Id | Info
----|----|----
Chat info | `[dataSaveId]/imChatsInfos/[random generated UUID]` | Stores all relevant data and infos about the chat (chat type, ...).
IM message | `[dataSaveId]/imChats/[chat-data-save-UUID]/[JSON-Time]`, where JSON-Time is the result of `new Date().toJSON()` (a ISO date/time string `2017-10-27T22:21:01.865Z`). | Stores data of a single message in the chat.

Chat info docs contains:

Key | Type | What is it
----|------|------------
`chatType` | String | Type of the IM Chat. `personal`, `group` or `conference`.
`chatUUID` | String(UUID) | UUID of the IM Chat. Used in ID of the package.
`target` | String(UUID) | UUID of the target. This could be the other avatar-id, group-id or session-id.
`name` | String | Name of the target(s).
`saveId` | String(UUID) | Random generated UUID that is used in the `_id` of a message.

The local chat doc contains every required data for its [dialog type](http://wiki.secondlife.com/wiki/ImprovedInstantMessage).
