import test from 'ava'
import sinon from 'sinon'

/**
 * Library under test
 */

import NewSessionEmitter from '../src/new-session-emitter'

let spy: any
let clock: any
let sessionEmitter: any

test.beforeEach(() => {
    spy = sinon.spy()
    clock = sinon.useFakeTimers()

    sessionEmitter = new NewSessionEmitter(['1D'])
    sessionEmitter.on('newSession', spy)
})

test.afterEach(() => {
    clock.restore()
})

/*********************************************************************
 * Tests
 ********************************************************************/

const invalidTimeframeThrowsArgumentError = (t: any, timeframe: string) => {
    const error = t.throws(() => new NewSessionEmitter([timeframe]), Error)
    t.is(error.name, 'ArgumentError')
}
invalidTimeframeThrowsArgumentError.title = (_ = '', timeframe: string) => `invalid timeframe '${timeframe}' should throw ArgumentError`

const invalidTimeframes = ['', '5B', '5d', 'p', 'D4', '!!', 'H4', '1m']
invalidTimeframes.map(timeframe => test(invalidTimeframeThrowsArgumentError, timeframe))

test('assigns a subscription to a newSession event', t => {
    sessionEmitter.emit('newSession')
    t.true(spy.called)
})

test('passes arguments from the emit() call', t => {
    sessionEmitter.emit('newSession', ['1'])
    t.true(spy.calledWith(['1']))
})

test('calls every time the event is emitted', t => {
    sessionEmitter.emit('newSession')
    sessionEmitter.emit('newSession')
    t.is(spy.callCount, 2)
})

test('emits to multiple listeners', t => {
    const spyA = sinon.spy()
    const spyB = sinon.spy()

    sessionEmitter.on('newSession', spyA)
    sessionEmitter.on('newSession', spyB)
    sessionEmitter.emit('newSession')

    t.true(spyA.called)
    t.true(spyB.called)
})

test('events are emitted on specified session-close', t => {
    const callback = sinon.fake()
    let emitter = new NewSessionEmitter(['1'])
    emitter.on('newSession', callback)

    t.true(callback.notCalled)

    clock.tick(1000 * 60)
    t.true(callback.calledOnce)
})

test('canceled events are not emitted on specified session-close', t => {
    const callback = sinon.fake()
    const signal = new NewSessionEmitter(['1'])
    let emitter = signal
    emitter.on('newSession', callback)

    t.true(callback.notCalled)

    clock.tick(1000 * 60)
    t.true(callback.calledOnce)

    signal.cancel()

    clock.tick(2000 * 60)
    t.true(callback.calledOnce)
})

test('closed sessions are emitted in string-representation', t => {
    const callback = sinon.fake()
    const timeframes = ['1']
    let emitter = new NewSessionEmitter(timeframes)
    emitter.on('newSession', callback)
    emitter.on('newSession', (emittedTimeframes: string[]) => {
        t.deepEqual(timeframes, emittedTimeframes)
    })

    t.true(callback.notCalled)

    clock.tick(1000 * 60)
    t.true(callback.calledOnce)
})
