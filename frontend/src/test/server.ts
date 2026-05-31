import { setupServer } from 'msw/node'
import { authHandlers } from './handlers/auth'
import { proposalHandlers } from './handlers/proposals'

export const server = setupServer(...authHandlers, ...proposalHandlers)
