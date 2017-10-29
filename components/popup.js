'use strict'

import React from 'react'

import style from './popup.css'

export default function Popup (props) {
  return <div className={style.Background}>
    <div className={style.Main}>
      <div className={style.Head}>
        <a href='#' onClick={event => {
          event.preventDefault()
          props.onClose()
        }}>
          <img src='/icon_close.svg' alt='close popup' height='32' width='32' />
        </a>
        <h4 className={style.Title}>{props.title}</h4>
      </div>
      <div className={style.Content}>
        {props.children}
      </div>
    </div>
  </div>
}
