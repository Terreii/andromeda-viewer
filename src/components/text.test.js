import { axe } from 'jest-axe'
import React from 'react'
import { render } from '@testing-library/react'

import Text from './text'

it('renders without crashing', () => {
  const { container } = render(
    <div>
      <Text
        text={'Hello World! https://en.wikipedia.org/wiki/Second_Life ' +
        '[http://wiki.secondlife.com/wiki/Main_Page the second life wiki]'}
      />
    </div>
  )

  expect(container).toBeTruthy()
})

it('should render plain URLs as <a>', () => {
  const { queryByText } = render(
    <div>
      <Text text='Hello World! https://en.wikipedia.org/wiki/Second_Life' />
    </div>
  )

  expect(queryByText('https://en.wikipedia.org/wiki/Second_Life')).toBeTruthy()
  expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').tagName).toBe('A')
  expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').href)
    .toBe('https://en.wikipedia.org/wiki/Second_Life')
  expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').rel)
    .toBe('noopener noreferrer')
})

it('should render plain URLs after a firefox chat info', () => {
  const { queryByText } = render(
    <div>
      <Text
        text={'(32W 6.3.2f*) http://wiki.secondlife.com/wiki/Main_Page ' +
        'https://en.wikipedia.org/wiki/Second_Life'}
      />
    </div>
  )

  expect(queryByText('http://wiki.secondlife.com/wiki/Main_Page')).toBeTruthy()
  expect(queryByText('http://wiki.secondlife.com/wiki/Main_Page').tagName).toBe('A')
  expect(queryByText('http://wiki.secondlife.com/wiki/Main_Page').href)
    .toBe('http://wiki.secondlife.com/wiki/Main_Page')
  expect(queryByText('http://wiki.secondlife.com/wiki/Main_Page').rel)
    .toBe('noopener noreferrer')

  expect(queryByText('https://en.wikipedia.org/wiki/Second_Life')).toBeTruthy()
  expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').tagName).toBe('A')
  expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').href)
    .toBe('https://en.wikipedia.org/wiki/Second_Life')
  expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').rel)
    .toBe('noopener noreferrer')
})

it('should render formatted URLs as <a> with the text as its child', () => {
  const { queryByText } = render(
    <div>
      <Text text='Hello World! [http://wiki.secondlife.com/wiki/Main_Page the second life wiki]!' />
    </div>
  )

  expect(queryByText('the second life wiki')).toBeTruthy()
  expect(queryByText('the second life wiki').tagName).toBe('A')
  expect(queryByText('the second life wiki').href)
    .toBe('http://wiki.secondlife.com/wiki/Main_Page')
  expect(queryByText('the second life wiki').rel)
    .toBe('noopener noreferrer')
})

it('should use its className for the <a>', () => {
  const { queryByText } = render(
    <div>
      <Text
        text={'Hello World! https://en.wikipedia.org/wiki/Second_Life ' +
        '[http://wiki.secondlife.com/wiki/Main_Page the second life wiki]'}
        className='text-class'
      />
    </div>
  )

  expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').className)
    .toBe('text-class')

  expect(queryByText('the second life wiki').className)
    .toBe('text-class')
})

it('should support multiline mode', () => {
  const { queryByText } = render(
    <div>
      <Text
        text={'Hello World! https://en.wikipedia.org/wiki/Second_Life\n' +
        '[http://wiki.secondlife.com/wiki/Main_Page the second life\nwiki]'}
        multiline
      />
    </div>
  )

  const sibling = queryByText('https://en.wikipedia.org/wiki/Second_Life').nextElementSibling
  expect(sibling).toBeTruthy()
  expect(sibling.nodeName).toBe('BR')

  const brChild = queryByText('the second life', { exact: false }).querySelector('br')
  expect(brChild).toBeTruthy()
  expect(brChild.nodeName).toBe('BR')
})

it('should pass aXe', async () => {
  const { container } = render(
    <div>
      <Text
        text={'Hello World! https://en.wikipedia.org/wiki/Second_Life ' +
        '[http://wiki.secondlife.com/wiki/Main_Page the second life wiki]'}
      />
    </div>
  )

  expect(await axe(container)).toHaveNoViolations()
})
