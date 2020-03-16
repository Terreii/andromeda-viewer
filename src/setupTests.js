import { toHaveNoViolations } from 'jest-axe'
import MutationObserver from '@sheerun/mutationobserver-shim'

expect.extend(toHaveNoViolations)

// Remove this (and uninstall it) after "react-scripts" ships with Jest v25
window.MutationObserver = MutationObserver
