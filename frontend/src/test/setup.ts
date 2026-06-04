import '@testing-library/jest-dom'
import { server } from './server'
import { beforeAll, afterEach, afterAll } from 'vitest'

// Radix UI Select requires pointer capture and scroll APIs not available in jsdom
window.HTMLElement.prototype.hasPointerCapture = () => false
window.HTMLElement.prototype.setPointerCapture = () => {}
window.HTMLElement.prototype.releasePointerCapture = () => {}
window.HTMLElement.prototype.scrollIntoView = () => {}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
