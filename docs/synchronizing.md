# Synchronizing

## General

Andromeda uses [Hoodie](https://hood.ie) ([GitHub](https://github.com/hoodiehq)) for the server, accounts and synchronizing of chat logs, avatars and grids.Andromeda uses [Hoodie](‪https://hood.ie‬) ([GitHub](‪https://github.com/hoodiehq‬)) for the server, accounts and synchronizing of chat logs, avatars and grids.

## Account

An account of the viewer is a hoodie-account. Sign in and out is handled by hoodies account module. Look at the [readme.md](https://github.com/hoodiehq/hoodie-account-client/blob/master/README.md) and [documentation](http://docs.hood.ie/en/latest/api/client/hoodie.account.html) of it.

## Store

All data that will be synchronized must be stored in hoodies store module. It’s API is documented in its [readme.md](https://github.com/hoodiehq/hoodie-store-client/blob/master/README.md) and [documentation](http://docs.hood.ie/en/latest/api/client/hoodie.store.html).
The store is a NoSQL database based on PouchDB and inspired by CouchDB. Data is saved in documents (doc). An doc is a JSON-Object. no Array as base! Every doc has an ID-string (`_id` key) that is unique for a database.

## Store Layout

Docs are organized with prefixes on their IDs, separated with `/`. View it as folders with JSON-files in it.

### Avatars

Avatars are saved under `avatars/` appended with the avatar-identifier. The avatar-identifier consist out of the full avatar name, separated by a space then an `@` followed by an grid name.

All the avatar doc saves is its name and the grid name it is on. Future version my save avatar specific settings (like default login position or RLV).

### Grids

Grids are saved under `grids/` appended by its name. It saves currently only its name and loginURL.

### Data of an Avatar

Every avatar, that is synced, saves its data under `avatarName@gridName/`. Where avatarName is the name of the avatar and gridName is the name of the grid the avatar is from.

Currently only local-chat messages and IM-messages are saved.

#### Local Chat

Local chat messages are saved by messages. Their ID has the structure of `avatar-identifer/localchat/JSON-Time` where JSON-Time is the result of toJSON() on a Date-object `2017-10-27T22:21:01.865Z`.

The local chat doc contains every required data for its chat type. See in the wiki under [ChatFromSimulator](http://wiki.secondlife.com/wiki/ChatFromSimulator) and [ChatFromViewer](http://wiki.secondlife.com/wiki/ChatFromViewer).

#### IM Chat

IMs are saved by message. There are two types of docs for IMs.

Key | Id
----|---
Chat info | Saved under `avatar-identifer/imChatsInfos/imChatUUID`
IM message | Saved under `avatar-identifer/imChats/imChatUUID/JSON-Time`, where JSON-Time is the result of toJSON() on a Date-object `2017-10-27T22:21:01.865Z`.

Chat info docs contains:

Key | Type | What is it
----|------|------------
chatType | String | Type of the IM Chat. `personal`, `group` or `session`
chatUUID | String(UUID) | UUID of the IM Chat. Used in ID of the package.
target | String(UUID) | UUID of the target. This could be the other avatar-id, group-id or session-id.
name | String | Name of the target(s).

The local chat doc contains every required data for its [dialog type](http://wiki.secondlife.com/wiki/ImprovedInstantMessage).
