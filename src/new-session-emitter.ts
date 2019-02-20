/**
 * new-session-emitter
 * Emit a signal on conclusion of specified sessions (UTC)
 */

import { utcDate } from '@hamroctopus/utc-date'
import { inTradingviewFormat } from '@strong-roots-capital/is-tradingview-format'
import { EventEmitter } from 'events'
import session from 'market-session'
import schedule from 'node-schedule'
import ow from 'ow'
import StrictEventEmitter from 'strict-event-emitter-types'

const everyMinute = '1 * * * * *'  // Every minute at one-second past

/**
 * Enumeration of events emitted by `NewSessionEmitter`.
 */
interface Events {
    newSession: string[]
}

/**
 * Necessary intermediate-class to cast EventEmitter to StrictEventEmitter,
 * see documentation at https://github.com/bterlson/strict-event-emitter-types.
 */
type StrictEmitter = StrictEventEmitter<EventEmitter, Events>


/**
 * Emits a `newSession` signal at the start of specified sessions
 * (UTC).
 */
export default class NewSessionEmitter extends (EventEmitter as { new(): StrictEmitter }) {

    private timeframes: string[]
    private timer: schedule.Job

    /**
     * Create a NewSessionEmitter, specifying the timeframes on which
     * to monitor for new sessions. Timeframes are expected to be in
     * valid Trading View format.
     *
     * @param timeframes - List of timeframes on which to emit events
     */
    constructor(timeframes: string[]) {
        super()

        timeframes.forEach(timeframe => ow(timeframe, ow.string.is(inTradingviewFormat)))

        this.timeframes = timeframes
        this.timer = schedule.scheduleJob(everyMinute, this.timerISR.bind(null, this))
    }

    /**
     * Handle new-minute events: check for end-of-session and emit a
     * `newSession` event.
     *
     * @remarks
     * This ISR is invoked by a scheduled job via `node-schedule`,
     * which does not preserve the context of `this`. Instead,
     * bind `this` to parameter `context` during timer initialization
     *
     * ```ts
     * this.timer = schedule.scheduleJob(everyMinute, this.timerISR.bind(null, this))
     * ```
     *
     * @param context - Used in stead of `this`
     */
    private timerISR(context: NewSessionEmitter): void {
        const closedSessions = session(utcDate(), context.timeframes)

        if (closedSessions.length > 0) {
            context.emit('newSession', closedSessions)
        }
    }

    /**
     * Cancel the recurring `newSession` events.
     */
    cancel(): void {
        this.timer.cancel()
    }
}
