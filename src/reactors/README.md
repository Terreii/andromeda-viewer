# Reactors

In this directory are the __reactors__.

Reactors react to state-changes. Without the UI. They allow to centralize calling of actions that need to dispatch on specific state.

## Behaviour

On every state-change, every reactor gets the new state. If the state did change in a way that one of them should react, then it will return an event. And for that state-change no more reactors will get called.

The advantage is: not every action or event that changes something, needs to include every aspect of it. 

## By example

There is a reactor thats checks if all groups-chat where started. There are more than one events that inform, that a group got added to the avatar.

Every event or action would have to call a `startGroupChat` event. But now they can be an event that adds the group.

After this event the reactors get the new state. The `groupsDidLoad` reactor checks if there is a group that doesn't have an active chat.
 - If this is the case, then it will return the `startGroupChat` action/event.
 - If every group did start their chat, then it will return `null` and the next reactor will get called.

For speed reasons __every reactor is a selector__. They will save their inputs and result. And if the inputs are the same, they return the same result. They are then checked, if they return the same:
 - If the result is not equal the last (`===`), then the event will get dispatched!
 - The the result is equal the last (`===`), then the event will not get dispatched!
