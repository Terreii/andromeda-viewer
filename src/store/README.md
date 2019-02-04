# Store

In this directory is the store.

## configureStore

This is the module that contains the store. It exports a functions that creates the store.

In it [__Hoodie__](http://hood.ie/) gets added to redux-thunk.

## configureReactors

This module loads all reactors and a guard gets added, that guard against dispatching the same action twice.

## In development

In development *configureStore* replaces updated *reducers*. And *configureReactors* replaces updated *reactors*.

The store or configureReactors are __not__ hot-reloaded. If they change, the whole web-app gets reloaded!
