# Synchronizing

## General

Andromeda is a [Hoodie](https://hood.ie) ([GitHub](https://github.com/hoodiehq)) web-app. Hoodie handles the server, accounts, and synchronizing of user data.

## Account

An account of the viewer is a hoodie-account. Hoodies account module handles sign up, sign in and sign out. Look at its [readme.md](https://github.com/hoodiehq/hoodie-account-client/blob/master/README.md) and [documentation](http://docs.hood.ie/en/latest/api/client/hoodie.account.html) of it.
An account name is always an email-address.

## Store

All synchronizing data, must get stored in hoodies user store. [hoodie-plugin-store-crypto](https://github.com/Terreii/hoodie-plugin-store-crypto) must get used for it! It builds on top of [hoodie-store-client](https://github.com/hoodiehq/hoodie-store-client/).
[Hoodies store](https://github.com/hoodiehq/hoodie-store-client/) ([documentation](http://docs.hood.ie/en/latest/api/client/hoodie.store.html)) is a NoSQL database based on PouchDB and CouchDB. Documents (doc) are the data unit of CouchDB. A doc is a JSON-Object. No Array as base! Every doc has an ID-string (`_id` key) that is unique for a database. It is the way to find a doc.
Every user has their own database.

## Encryption

Andromeda uses [hoodie-plugin-store-crypto](https://github.com/Terreii/hoodie-plugin-store-crypto) to encrypt and decrypt user data.
It uses `pbkdf2` with `sha256` to generate a key and `AES-GCM` for data encryption.
The salt gets synced, but the encryption password and key are not synchronized!
Because the `_id` can't get encrypted, most data uses some random generated UUIDs in their names.

## Store Layout

Docs get organized using prefixes on their IDs, separated with `/`. View it as folders with JSON-files in it.
Data from an avatar (chats) have `dataSaveId` as prefix. This is a random generated UUID unique to that avatar!
- [`avatars/`](#avatars)
- [`grids/`](#grids)
- [`[dataSaveId]/localchat/`](#local-chat)
- [`[dataSaveId]/imChatsInfos/`](#im-chat)
- [`[dataSaveId]/imChats/`](#im-chat)

### Avatars

Avatars get saved under `avatars/`, appended by an UUID.

The doc stores:

key | description
---|---
`_id` | `avatars/[random generated UUID]`
`dataSaveId` | A random generated UUID, that is used as a prefix for all data of this avatar.
`avatarIdentifier` | The avatar-identifier consist out of the full avatar name. Then an `@`. Followed by an grid name. Where the first and last name are separated by a space. Used to differentiate the avatars. `Tester Resident@OS Grid`.
`name` | Full name of the avatar. Will be displayed on login screen.
`grid` | Name of the grid this avatar belongs to.

Future version may save avatar specific settings (like default login position or RLV).

### Grids

Grids get saved under `grids/` appended by an UUID.

The doc stores:

key | description
---|---
`_id` | `grids/[random generated UUID]`.
`name` | Display name and identifier in the avatar docs.
`loginURL` | URL of the login endpoint.

### Data of an Avatar

Every saved avatar saves its data under `[dataSaveId]/`. Where dataSaveId is the random generated UUID that get stored in the avatar doc.

Data that gets saved and synced:
- local-chat messages
- IM chats and messages

#### Local Chat

Local chat messages get saved by messages. Their ID has the structure of `[dataSaveId]/localchat/[JSON-Time]`. Where JSON-Time is the result of `new Date().toJSON()` (a ISO date/time string `2017-10-27T22:21:01.865Z`).

The local chat doc contains every required data for its chat type. See in the wiki under [ChatFromSimulator](http://wiki.secondlife.com/wiki/ChatFromSimulator) and [ChatFromViewer](http://wiki.secondlife.com/wiki/ChatFromViewer).

#### IM Chat

IMs get saved by message. There are two types of docs for IMs.

Key | Id | Info
----|----|----
Chat info | `[dataSaveId]/imChatsInfos/[random generated UUID]` | Stores all relevant data and infos about the chat (chat type, target, ...).
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
