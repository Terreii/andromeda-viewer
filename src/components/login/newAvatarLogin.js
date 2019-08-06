import React, { useState, useEffect, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { Button, Input, FormField, Help } from '../formElements'

const Container = styled.form`
  display: flex;
  flex-direction: column;
  background-color: rgb(110, 110, 110);
  margin: 1em;
  padding: 1em;
  max-width: calc(100vw - 2em);
  border-radius: .5em;
  box-shadow: 0.2em 0.2em 0.4em 0.1em black;

  & > span, & > div {
    margin-top: .7em;
  }

  @supports (display: grid) {
    display: grid;
    grid-template-areas:
      "title title title"
      "name name-input name-input"
      "password password-input password-input"
      "grid grid-select grid-select"
      "new-grid new-grid new-grid"
      "save save login";
    grid-gap: .5em;
    text-align: left;

    & > span, & > div {
      margin-top: 0em;
    }
  }

  &.not-selected {
    cursor: pointer;
    background-color: rgb(95, 95, 95);
    box-shadow: 0.1em 0.1em 0.3em 0px black;
  }

  &.not-selected:focus {
    outline: 2px solid highlight;
  }

  & input:invalid {
    outline: 1px solid red;
  }
`

const Title = styled.h2`
  grid-area: title;
  margin: .3em;
  text-align: center;
  white-space: nowrap;
  font-size: 120%;

  @media (max-width: 450px) {
    white-space: normal;
  }
`

const ActiveText = styled.span`
  grid-area: password / password / password-input-end / password-input-end;
  text-align: center;
  color: rgba(255, 255, 255, .7);
`

const Name = styled.label`
  grid-area: name;
`

const NameInput = styled(Input)`
  grid-area: name-input;
`

const Password = styled.label`
  grid-area: password;
`

const PasswordInput = styled(Input)`
  grid-area: password-input;
`

const Grid = styled.label`
  grid-area: grid;
`

const GridSelect = styled(Input.withComponent('select'))`
  grid-area: grid-select;
`

const SaveNew = styled.div`
  grid-area: save;
`

const LoginButton = styled(Button)`
  grid-area: login;
`

const NewGridLine = styled.fieldset`
  grid-area: new-grid;
  display: ${props => props.show ? 'flex' : 'none'};
  flex-direction: row;
  flex-direction: column;

  & > div > label {
    color: rgba(255, 255, 255, 0.87);
  }

  & > div {
    flex: auto;
  }

  & > #newGridIsLLSDLabel {
    margin-top: 0.3em;
  }
`

const SaveHelp = styled(Help)`
  color: white;
`

export default function NewAvatarLogin ({
  isSelected,
  isSignedIn,
  isLoggingIn,
  grids,
  onSelect,
  onLogin
}) {
  const [name, isNameValid, onNameChange] = useInput('')
  const [password, isPwValid, onPasswordChange] = useInput('')

  const [saveAvatar, setSaveAvatar] = useState(isSignedIn)
  const lastIsSignedIn = useRef(isSignedIn)
  useEffect(() => {
    if (isSignedIn !== lastIsSignedIn.current && name.length === 0 && password.length === 0) {
      setSaveAvatar(isSignedIn)
      lastIsSignedIn.current = isSignedIn
    }
  }, [isSignedIn, lastIsSignedIn, name, password, setSaveAvatar])

  const [selectedGrid, setSelectedGrid] = useState('Second Life')
  const [gridName, isGridNameValid, onGridNameChange] = useInput('')
  const [gridUrl, isGridUrlValid, onGridUrlChange] = useInput('')
  const [isGridLLSD, setIsGridLLSD] = useState(true)

  if (!isSelected) {
    const onSetActive = event => {
      event.preventDefault()
      onSelect('new')
    }

    return <Container
      onClick={onSetActive}
      onKeyUp={event => {
        if (event.keyCode === 13) {
          onSetActive(event)
        }
      }}
      className='not-selected'
      tabIndex='0'
    >
      <Title>Add avatar or login anonymously</Title>

      <ActiveText>click to add</ActiveText>
    </Container>
  }

  const isNewGrid = selectedGrid === ''

  const gridIsValid = !isNewGrid || (isGridNameValid && isGridUrlValid)

  const isValid = isNameValid && name.length > 1 && isPwValid && gridIsValid

  const doLogin = event => {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    if (!isValid) return

    const grid = selectedGrid !== ''
      ? selectedGrid
      : {
        name: gridName,
        url: gridUrl,
        isLoginLLSD: isGridLLSD
      }
    const save = saveAvatar && isSignedIn

    onLogin(name, password, grid, save)
  }

  const onKeyUp = event => {
    if (event.keyCode === 13) {
      doLogin(event)
    }
  }

  return <Container>
    <Title>
      {isSignedIn ? 'Add avatar or ' : ''}
      login anonymously
    </Title>

    <Name htmlFor='newAvatarNameInput'>Avatar:</Name>
    <NameInput
      id='newAvatarNameInput'
      type='text'
      className='medium'
      value={name}
      onChange={onNameChange}
      onKeyUp={onKeyUp}
      disabled={isLoggingIn}
      minLength='1'
      required
      autoFocus
      onFocus={event => {
        const target = event.target

        setTimeout(() => {
          if (target == null) return

          target.parentElement.scrollIntoView(true)
        }, 16)
      }}
    />

    <Password htmlFor='newAvatarPasswordInput'>Password:</Password>
    <PasswordInput
      id='newAvatarPasswordInput'
      type='password'
      className='medium'
      value={password}
      onChange={onPasswordChange}
      onKeyUp={onKeyUp}
      disabled={isLoggingIn}
      minLength='2'
      required
    />

    <Grid htmlFor='newAvatarGridSelection'>Grid:</Grid>
    <GridSelect
      id='newAvatarGridSelection'
      className='medium'
      value={selectedGrid}
      onChange={event => { setSelectedGrid(event.target.value) }}
    >
      {grids.map(grid => <option key={grid.name} value={grid.name}>
        {grid.name}
      </option>)}

      <option value=''>+ Add new Grid</option>
    </GridSelect>

    {isNewGrid && <NewGridLine show>
      <legend>Add a new Grid</legend>

      <FormField>
        <label htmlFor='newGridNameInput'>Name</label>
        <Input
          id='newGridNameInput'
          type='text'
          value={gridName}
          onChange={onGridNameChange}
          onKeyUp={onKeyUp}
          minLength='1'
          required
        />
      </FormField>
      <FormField>
        <label htmlFor='newGridUrlInput'>URL</label>
        <Input
          id='newGridUrlInput'
          type='url'
          placeholder='https://example.com/login'
          value={gridUrl}
          onChange={onGridUrlChange}
          onKeyUp={onKeyUp}
          required
        />
      </FormField>
      <label
        id='newGridIsLLSDLabel'
        title={'Most grids will support LLSD based logins.\r\n' +
          "Only un-check if grid doesn't support it!"}
      >
        <Input
          id='newGridIsLLSD'
          type='checkbox'
          checked={isGridLLSD}
          onChange={event => { setIsGridLLSD(event.target.checked) }}
        />
        Grid uses LLSD login
      </label>
    </NewGridLine>}

    <SaveNew>
      <input
        id='saveNewAvatarButton'
        type='checkbox'
        onChange={event => { setSaveAvatar(event.target.checked) }}
        checked={saveAvatar}
        disabled={!isSignedIn || isLoggingIn}
        aria-describedby='saveNewAvatarHelp'
      />
      <label htmlFor='saveNewAvatarButton'>Save / Add</label>
      <br />
      <SaveHelp id='saveNewAvatarHelp'>
        Save and sync this avatar and it's chats,
        <br />
        after the first successful login.
      </SaveHelp>
    </SaveNew>
    <LoginButton
      id='newAvatarLoginButton'
      onClick={doLogin}
      disabled={isLoggingIn || !isValid}
    >
      {isLoggingIn === name ? 'Connecting ...' : 'Login'}
    </LoginButton>
  </Container>
}

function useInput (defaultValue) {
  const [value, setValue] = useState(defaultValue)
  const [isValid, setIsValid] = useState(false)

  const onChange = useCallback(event => {
    setValue(event.target.value)
    setIsValid(event.target.validity.valid)
  }, [setValue, setIsValid])

  return [value, isValid, onChange]
}
