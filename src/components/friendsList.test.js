import { axe } from 'jest-axe'
import React from 'react'
import { mount } from 'enzyme'
import Immutable from 'immutable'

import FriendsList from './friendsList'
import AvatarName from '../avatarName'

test('renders without crashing', () => {
  const friends = Immutable.fromJS([
    {
      id: 'first',
      rightsGiven: {},
      rightsHas: {}
    }
  ])

  const names = Immutable.Map({
    first: new AvatarName('Testery MacTestface')
  })

  mount(<FriendsList
    friends={friends}
    names={names}
  />)
})

test('rendering', () => {
  const friends = Immutable.fromJS([
    {
      id: 'first',
      rightsGiven: {
        canSeeOnline: true,
        canSeeOnMap: false,
        canModifyObjects: true
      },
      rightsHas: {
        canSeeOnline: true,
        canSeeOnMap: false,
        canModifyObjects: true
      }
    },
    {
      id: 'other',
      rightsGiven: {
        canSeeOnline: false,
        canSeeOnMap: true,
        canModifyObjects: false
      },
      rightsHas: {
        canSeeOnline: false,
        canSeeOnMap: true,
        canModifyObjects: false
      }
    }
  ])

  const names = Immutable.Map({
    first: new AvatarName('Testery MacTestface'),
    other: new AvatarName('Buddy Budds')
  })

  const list = mount(<FriendsList
    friends={friends}
    names={names}
  />)

  const liElements = list.find('li')
  expect(liElements.length).toBe(2)
  liElements.forEach((row, index) => {
    const isFirst = index === 0

    expect(row.find('img[src="chat_bubble.svg"]').prop('alt'))
      .toBe('Start new chat with ' + (isFirst ? 'Testery Mactestface' : 'Buddy Budds'))

    expect(row.find('input[type="checkbox"]').length).toBe(5)
  })
})

test('event handling/changing rights', () => {
  const friends = Immutable.fromJS([
    {
      id: 'first',
      rightsGiven: {
        canSeeOnline: false,
        canSeeOnMap: false,
        canModifyObjects: false
      },
      rightsHas: {
        canSeeOnline: false,
        canSeeOnMap: false,
        canModifyObjects: false
      }
    }
  ])

  const names = Immutable.Map({
    first: new AvatarName('Testery MacTestface')
  })

  const changeCounts = {
    canSeeOnline: 0,
    canSeeOnMap: 0,
    canModifyObjects: 0
  }

  const list = mount(<FriendsList
    friends={friends}
    names={names}
    updateRights={(friendId, data) => {
      expect(friendId).toBe('first')
      Object.keys(data).forEach(key => {
        changeCounts[key] += 1
      })
    }}
  />)

  const checkboxen = list.find('input[type="checkbox"]')
  expect(checkboxen.length).toBe(5)

  checkboxen.forEach(checkbox => {
    checkbox.simulate('change', {
      target: {
        disabled: false,
        checked: true
      }
    })
  })

  checkboxen.forEach(checkbox => {
    checkbox.simulate('change', {
      target: {
        disabled: true,
        checked: true
      }
    })
  })

  expect(changeCounts).toEqual({
    canSeeOnline: 1,
    canSeeOnMap: 1,
    canModifyObjects: 1
  })
})

test('should pass aXe', async () => {
  const friends = Immutable.fromJS([
    {
      id: 'first',
      rightsGiven: {},
      rightsHas: {}
    }
  ])

  const names = Immutable.Map({
    first: new AvatarName('Testery MacTestface')
  })

  const rendered = mount(<FriendsList
    friends={friends}
    names={names}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
