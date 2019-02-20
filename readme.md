# new-session-emitter [![Build status](https://travis-ci.org/strong-roots-capital/new-session-emitter.svg?branch=master)](https://travis-ci.org/strong-roots-capital/new-session-emitter) [![npm version](https://img.shields.io/npm/v/@strong-roots-capital/new-session-emitter.svg)](https://npmjs.org/package/@strong-roots-capital/new-session-emitter) [![codecov](https://codecov.io/gh/strong-roots-capital/new-session-emitter/branch/master/graph/badge.svg)](https://codecov.io/gh/strong-roots-capital/new-session-emitter)

> Emit a signal on conclusion of desired session (UTC)

## Install

``` shell
npm install @strong-roots-capital/new-session-emitter
```

## Use

``` typescript
import NewSessionEmitter from '@strong-roots-capital/new-session-emitter'

let sessionEmitter = new NewSessionEmitter(['1', '5', '15', '1H'])
sessionEmitter.on('newSession', ISR)

function ISR(timeframes: string[]) {
    console.log('New sessions:', new Date(), timeframes)
}
```

## Related

- [market-session](https://github.com/strong-roots-capital/market-session)
