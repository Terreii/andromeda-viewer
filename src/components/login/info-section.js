import React from 'react'
import { useTabState, Tab, TabList, TabPanel } from 'reakit'

import { viewerName, author, repositoryUrl } from '../../viewerInfo'

import styles from './info-section.module.css'

export default function InfoSection () {
  const tab = useTabState(() => ({ selectedId: 'general' }))

  return <div>
    <TabList {...tab} aria-label='Infos tabs'>
      <Tab {...tab} stopId='general'>
        Welcome
      </Tab>

      <Tab {...tab} stopId='terms'>
        Terms Of Service
      </Tab>

      <Tab {...tab} stopId='privacy'>
        Privacy Policy
      </Tab>

      <Tab {...tab} stopId='encryption'>
        Encryption
      </Tab>

      <Tab {...tab} stopId='open-source'>
        Open Source
      </Tab>
    </TabList>

    <TabPanel {...tab} stopId='general' className={styles.panel}>
      <h2>Welcome to <span className={styles.viewerName}>{viewerName}</span>!</h2>

      <p>
        Hi, I’m <a href={author.url} target='_blank' rel='noopener noreferrer'>
          {author.name.split(' ')[0]}
        </a>. I developed
        <span className={styles.viewerName}> {viewerName} </span>
        as a hobby in my spare time.
        <br />
        And it is open source!{' '}
        <a href={repositoryUrl} target='_blank' rel='noopener noreferrer'>
          Come and have a look around
        </a>
        . (Be careful there will be feature spoilers! 😉)
      </p>

      <p>
        Currently only local chat, IMs, group chat, notifications and friends and groups list
        are supported.
      </p>

      <p>I can’t give you costumer support, but you can contact me:</p>
      <ul>
        <li>at <a href={`mailto:${author.email}`}>{author.email}</a></li>
        <li>or IM in world <b>{'Avatar name placeholder'}</b></li>
      </ul>
      <p>
        <b>I’ll try to read every message, but can’t respond to them all. </b>
        Thanks for understanding.
      </p>

      <h3>Protocol and safety</h3>

      <p>
        I know that a web based viewer can be suspicious to some. That’s why I want to be as open
        as possible. Did I already mention that this viewer is open source‽
        <i> *hint, hint, wink wink*</i>
      </p>

      <p>
        Browsers are sadly not capable to fully support the Second Life Protocol. Because of this
        situation a part of it must be send over a server. But the server will not store anything
        from the SL protocol!
        <br />
        Everything that is saved will first be encrypted on your computer and then,
        <em> if </em>
        you choose to, the encrypted version will be stored on the server.
      </p>

      <p>{'<<Placeholder for what will be send over the proxy server>>'}</p>

      <h3>Account and avatars</h3>

      <p>There are two types of logins:</p>
      <ul>
        <li>
          You can login with your <b>Avatar</b> without saving anything. When you log out,
          everything will be forgotten.
        </li>
        <li>
          When you did create an <b>Account</b>, then you can store and sync an avatar and
          its chat history.
        </li>
      </ul>

      <p>When you chose to create an {viewerName}-account, you will be asked for two passwords:</p>
      <ol>
        <li>Your <b>{viewerName}-account password</b>. Used to sign in to this viewer.</li>
        <li>And an <b>encryption password</b>. It is used to encrypt your avatars' data.</li>
      </ol>
    </TabPanel>

    <TabPanel {...tab} stopId='terms' className={styles.panel}>
      This are our Terms of Service
    </TabPanel>

    <TabPanel {...tab} stopId='privacy' className={styles.panel}>
      Privacy Policy
    </TabPanel>

    <TabPanel {...tab} stopId='encryption' className={styles.panel}>
      <h2>How our encryption works</h2>

      <details>
        <summary>
          The Encryption is implemented using my Package <a
            href='https://www.npmjs.com/package/hoodie-plugin-store-crypto'
            target='_blank'
            rel='noopener noreferrer'
          >
            <b>hoodie-plugin-store-crypto</b>
          </a>.
        </summary>
        It uses <a
          href='https://en.wikipedia.org/wiki/SHA-2'
          target='_blank'
          rel='noopener noreferrer'
        >
          <code>sha256</code>
        </a> and <a
          href='https://en.wikipedia.org/wiki/PBKDF2'
          target='_blank'
          rel='noopener noreferrer'
        >
          <code>pbkdf2</code>
        </a> for generating a crypto-key and <a
          href='https://en.wikipedia.org/wiki/Galois/Counter_Mode'
          target='_blank'
          rel='noopener noreferrer'
        >
          <code>AES-GCM</code>
        </a> for encryption.
      </details>

      <p>When you create an account you will be ask for two (2) passwords:</p>
      <dl>
        <dt>Password</dt>
        <dd>
          This is your sign in password. It is used to sign in to this viewer and is send to
          our servers.
        </dd>

        <dt>Encryption password</dt>
        <dd>
          This password is used to encrypt all your Avatars data.
          Your encryption password will <em>never leave</em> your machine!
        </dd>
      </dl>

      <p>
        Your encryption password will not even be stored! For this reason you must enter your
        encryption password every time you open a tab of this viewer.
      </p>

      <h3>What is encrypted?</h3>

      <p>
        If you choose to save your Avatar, all its data will be stored and synced encrypted.
        This includes:
      </p>
      <ul>
        <li>Avatar Name</li>
        <li>Grid</li>
        <li>Chat history (local chat and Instant Messages)</li>
        <li>Most future settings</li>
      </ul>
      <p>
        What is <em>not</em> encrypted is: All messages when they are send!<br />
        A big part of the SL protocol is not accessible from browsers and must be translated by a
        server. They are not encrypted! But <em>nothing not encrypted will be stored!</em>
      </p>
    </TabPanel>

    <TabPanel {...tab} stopId='open-source' className={styles.panel}>
      {/* Inspired by firefox's https://www.mozilla.org/en-US/about/legal/firefox/ */}
      <h2>We are Open-Source!</h2>

      <p>
        <span className={styles.viewerName}>{viewerName}</span> is free and open source software,
        mainly developed as a hobby project. There are a few things you should know:
      </p>

      <ul>
        <li>
          <span className={styles.viewerName}>{viewerName}</span>
          is made available to you under the terms of the{' '}
          <a
            href='https://www.apache.org/licenses/LICENSE-2.0'
            target='_blank'
            rel='noopener noreferrer'
          >
            Apache License Version 2.0
          </a>
          . This means you may use, copy and distribute
          <span className={styles.viewerName}> {viewerName} </span>
          to others. You are also welcome to modify the source code of
          <span className={styles.viewerName}> {viewerName} </span>
          as you want to meet your needs. The Apache License Version 2.0 gives you the right to
          distribute your modified versions, if you state your changes.
        </li>
        <li>
          I do not grant you any rights to my name or the
          <span className={styles.viewerName}> {viewerName} </span>
          trademarks or logos.
        </li>
        <li>
          You can find it's source-code at <a
            href={repositoryUrl}
            target='_blank'
            rel='noopener noreferrer'
          >
            {repositoryUrl}
          </a>.
        </li>
      </ul>
    </TabPanel>
  </div>
}
