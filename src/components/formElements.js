import styled from 'styled-components'

export const Button = styled.button`
  flex: auto;
  padding: .5em;
  font-size: 1rem;
  border-radius: .25rem;
  border: 0px;
  font-weight: 400;
  font-family: Helvetica, Arial, sans-serif;
  background: #e0e0e0;

  &:hover, &:focus {
    background: #cacbcd;
  }

  &:disabled {
    opacity: 0.65;
  }

  &.danger {
    color: #fff;
    background: #dc3545;

    &:hover, &:focus {
      background: #c82333;
    }
  }

  &.ok {
    color: #fff;
    background: #28a745;

    &:hover, &:focus {
      background: #218838;
    }
  }

  &.primary {
    color: #fff;
    background: #0d71bb;

    &:hover, &:focus {
      background: #0c5a93;
    }
  }

  &.secondary {
    background: #939393;

    &:hover, &:focus {
      background: #868686;
    }
  }
`
