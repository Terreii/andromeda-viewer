import React from 'react'

import formElementsStyles from '../formElements.module.css'
import styles from './avatarLogin.module.css'

export default class NewAvatarLogin extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      password: '',
      grid: 'Second Life',
      save: false,
      newGridName: '',
      newGridURL: '',
      valid: {
        name: false,
        password: false,
        grid: false, // is not used
        newGridName: false,
        newGridURL: false
      }
    }

    this._boundName = this._inInputChange.bind(this, 'name')
    this._boundPassword = this._inInputChange.bind(this, 'password')
    this._boundGridChange = this._inInputChange.bind(this, 'grid')
    this._boundSaveChange = this._saveChange.bind(this)

    this._boundNewGridName = this._inInputChange.bind(this, 'newGridName')
    this._boundNewGridURL = this._inInputChange.bind(this, 'newGridURL')

    this._boundLogin = this._onLogin.bind(this)
    this._boundKeyUp = this._onKeyUp.bind(this)
  }

  componentDidMount () {
    this.setState({
      save: this.props.isSignedIn
    })
  }

  componentWillReceiveProps (nextProps) {
    if (
      this.props.isSignedIn !== nextProps.isSignedIn &&
      this.state.name.length === 0 &&
      this.state.password.length === 0
    ) {
      this.setState({
        save: nextProps.isSignedIn
      })
    }
  }

  _inInputChange (key, event) {
    this.setState({
      [key]: event.target.value
    })

    const valid = event.target.validity.valid

    if (this.state.valid[key] !== valid) {
      const newValidState = Object.assign({}, this.state.valid, {
        [key]: valid
      })

      // setState collects all changes and applies it after this function call ends
      this.setState({
        valid: newValidState
      })
    }
  }

  _saveChange (event) {
    this.setState({
      save: event.target.checked
    })
  }

  _onLogin (event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    const name = this.state.name
    const password = this.state.password
    const grid = this.state.grid !== ''
      ? this.state.grid
      : {
        name: this.state.newGridName,
        url: this.state.newGridURL
      }
    const save = this.state.save && this.props.isSignedIn

    this.props.onLogin(name, password, grid, save)
  }

  _onKeyUp (event) {
    if (event.keyCode === 13) {
      this._onLogin(event)
    }
  }

  render () {
    if (!this.props.isSelected) {
      const onSetActive = event => {
        event.preventDefault()
        this.props.onSelect('new')
      }

      return <form
        className={`${styles.NewAvatarLoginContainer} ${styles['not-selected']}`}
        onClick={onSetActive}
        onKeyUp={event => {
          if (event.keyCode === 13) {
            onSetActive(event)
          }
        }}
        tabIndex='0'
      >
        <h2 className={styles.Title}>Add avatar or login anonymously</h2>

        <span className={styles.ActiveText}>click to add</span>
      </form>
    }

    const grids = this.props.grids.map(grid => {
      const name = grid.get('name')
      return <option key={name} value={name}>
        {name}
      </option>
    })

    const isNewGrid = this.state.grid === ''

    const gridIsValid = !isNewGrid ||
      (this.state.valid.newGridName && this.state.valid.newGridURL)

    const isValid = this.state.valid.name && this.state.name.length > 1 &&
      this.state.valid.password &&
      gridIsValid

    return <form className={styles.NewAvatarLoginContainer}>
      <h2 className={styles.Title}>
        {this.props.isSignedIn ? 'Add avatar or ' : ''}
        login anonymously
      </h2>

      <label className={styles.NewName} htmlFor='newAvatarNameInput'>Avatar:</label>
      <input
        id='newAvatarNameInput'
        type='text'
        className={styles.NewNameInput}
        value={this.state.name}
        onChange={this._boundName}
        onKeyUp={this._boundKeyUp}
        disabled={this.props.isLoggingIn}
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

      <label className={styles.NewPassword} htmlFor='newAvatarPasswordInput'>Password:</label>
      <input
        id='newAvatarPasswordInput'
        type='password'
        className={styles.PasswordInput}
        value={this.state.password}
        onChange={this._boundPassword}
        onKeyUp={this._boundKeyUp}
        disabled={this.props.isLoggingIn}
        minLength='2'
        required
      />

      <label className={styles.Grid} htmlFor='newAvatarGridSelection'>Grid:</label>
      <select
        id='newAvatarGridSelection'
        className={styles.GridSelection}
        value={this.state.grid}
        onChange={this._boundGridChange}
      >
        {grids}
        <option value=''>+ Add new Grid</option>
      </select>

      <fieldset className={styles.NewGridLine} data-show={isNewGrid}>
        <legend>Add a new Grid</legend>

        <div className={formElementsStyles.FormField}>
          <label htmlFor='newGridNameInput'>Name</label>
          <input
            id='newGridNameInput'
            type='text'
            className={formElementsStyles.Input}
            value={this.state.newGridName}
            onChange={this._boundNewGridName}
            onKeyUp={this._boundKeyUp}
            minLength='1'
            required={isNewGrid}
          />
        </div>
        <div className={formElementsStyles.FormField}>
          <label htmlFor='newGridUrlInput'>URL</label>
          <input
            id='newGridUrlInput'
            type='url'
            className={formElementsStyles.Input}
            placeholder='https://example.com/login'
            value={this.state.newGridURL}
            onChange={this._boundNewGridURL}
            onKeyUp={this._boundKeyUp}
            required={isNewGrid}
          />
        </div>
      </fieldset>

      <div className={styles.SaveNew}>
        <input
          id='saveNewAvatarButton'
          type='checkbox'
          onChange={this._boundSaveChange}
          checked={this.state.save}
          disabled={!this.props.isSignedIn || this.props.isLoggingIn}
          aria-describedby='saveNewAvatarHelp'
        />
        <label htmlFor='saveNewAvatarButton'>Save / Add</label>
        <br />
        <small id='saveNewAvatarHelp' className={styles.SaveHelp}>
          Save and sync this avatar and it's chats,
          <br />
          after the first successful login.
        </small>
      </div>
      <button
        className={styles.LoginButton}
        onClick={this._boundLogin}
        disabled={this.props.isLoggingIn || !isValid}
      >
        {this.props.isLoggingIn === this.state.name ? 'Connecting ...' : 'Login'}
      </button>
    </form>
  }
}
