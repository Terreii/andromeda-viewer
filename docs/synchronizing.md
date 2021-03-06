# Synchronising

## General

Andromeda is an [Express](https://expressjs.com/), [CouchDB](https://couchdb.apache.org/) & [PouchDB](https://pouchdb.com/) web-app.

PouchDB handles the storing and synchronising of user data.
Server side CouchDB handles accounts, syncing sessions, and storing user data.
While Express gets used for account creation, updating and more.

## Account

An account of the viewer is a [CouchDB-account](https://docs.couchdb.org/en/stable/intro/security.html). To create, update, delete and password reset, the methods in __account.js__ must get used.

An account name is always an UUID. The login-name is an email-address.
The email get stored in an `email` field.

To get the UUID/name a GET request gets made to `/api/session/account` with a basic login. The result contains the account infos. With them the client can login to CouchDB.

The account data will get stored in `_local/account`.
It is a [local doc](https://docs.couchdb.org/en/stable/api/local.html) that isn't synchronised.

## Password

The users password gets hashed on the client. First with `PBKDF2` and then with `HKDF`.
Using them the password gets hashed into 64 byte. The first 32 bytes are the server password,
while the last 32 bytes are the encryption password.

__The encryption password and users password will never leave the client!__

## Store

All synchronising data, must get stored in a local PouchDB database.
[hoodie-plugin-store-crypto](https://github.com/Terreii/hoodie-plugin-store-crypto) must get used to encrypt the users data!

PouchDB and CouchDB are NoSQL databases. Documents (doc) are the data unit of CouchDB.
A doc is a JSON-Object. No Array as base!

Every doc has an ID-string (`_id` key) that is unique for a database. It is the primary way to find a doc.

Every user has their own database.

## Encryption

Andromeda uses [hoodie-plugin-store-crypto](https://github.com/Terreii/hoodie-plugin-store-crypto) to encrypt and decrypt user data.
It uses `pbkdf2` with `sha256` to generate a key and `AES-GCM` for data encryption.
The salt gets synced, but the encryption password and key are not synchronised!
Because the `_id` can't get encrypted, most data uses some random generated UUIDs in their names.

## Store Layout

Docs get organised using prefixes on their IDs, separated with `/`. View it as folders with JSON-files in it.
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
