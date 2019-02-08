import styled from 'styled-components'

export const Button = styled.button`
  flex: auto;
  padding: .5em;
  font-size: 1rem;
  border-radius: .25rem;
  border: 0px;
  font-weight: 400;
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

export const Input = styled.input`
  padding: 0.45em 1em;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.3rem;
  font-size: 1rem;
  line-height: 1.2em;
  color: rgba(0, 0, 0, 0.87);

  &:focus {
    border-color: highlight;
  }

  &.medium {
    font-size: 0.75rem;
  }
`

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  margin: .3em;

  & > label {
    margin-right: .3em;
    color: rgba(0, 0, 0, 0.87);
    font-weight: 700;
    font-size: 0.8em;
    line-height: 1.4em;
  }
`

export const Help = styled.small`
  color: #6c757d;
  line-height: 1.5;
  display: ${props => props.hide ? 'none' : ''};

  &.Error {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 0.2em;
    padding: 0.50rem 1.00rem;
    margin-top: 0.25rem;
  }
`
