// -*- mode: javascript; js-indent-level: 2 -*-

import * as exec from '@actions/exec'
import fs = require('fs')
import * as os from 'node:os'
import * as path from 'node:path'
import * as tools from '../src/tools.js'
import {afterEach, expect, test, vi} from 'vitest'

vi.mock('@actions/exec', {spy: true})

afterEach(() => {
  vi.restoreAllMocks()
})

test('ensureSnapd installs snapd if needed', async () => {
  expect.assertions(4)

  const accessMock = vi
    .spyOn(fs.promises, 'access')
    .mockImplementation(
      async (
        filename: fs.PathLike,
        mode?: number | undefined
      ): Promise<void> => {
        throw new Error('not found')
      }
    )
  const statMock = vi
    .spyOn(fs.promises, 'stat')
    .mockImplementation(async (filename: fs.PathLike): Promise<fs.Stats> => {
      return Object.assign(fs.statSync(import.meta.filename), {uid: 0, gid: 0})
    })
  const execMock = vi
    .spyOn(exec, 'exec')
    .mockImplementation(
      async (program: string, args?: string[]): Promise<number> => {
        return 0
      }
    )

  await tools.ensureSnapd()

  expect(accessMock).toHaveBeenCalled()
  expect(statMock).toHaveBeenCalled()
  expect(execMock).toHaveBeenNthCalledWith(1, 'sudo', [
    'apt-get',
    'update',
    '-q'
  ])
  expect(execMock).toHaveBeenNthCalledWith(2, 'sudo', [
    'apt-get',
    'install',
    '-qy',
    'snapd'
  ])
})

test('ensureSnapd is a no-op if snapd is installed', async () => {
  expect.assertions(3)

  const accessMock = vi
    .spyOn(fs.promises, 'access')
    .mockImplementation(
      async (
        filename: fs.PathLike,
        mode?: number | undefined
      ): Promise<void> => {}
    )
  const statMock = vi
    .spyOn(fs.promises, 'stat')
    .mockImplementation(async (filename: fs.PathLike): Promise<fs.Stats> => {
      return Object.assign(fs.statSync(import.meta.filename), {uid: 0, gid: 0})
    })
  const execMock = vi
    .spyOn(exec, 'exec')
    .mockImplementation(
      async (program: string, args?: string[]): Promise<number> => {
        return 0
      }
    )

  await tools.ensureSnapd()

  expect(accessMock).toHaveBeenCalled()
  expect(statMock).toHaveBeenCalled()
  expect(execMock).not.toHaveBeenCalled()
})

test('ensureSnapd fixes permissions on the root directory', async () => {
  expect.assertions(3)

  const accessMock = vi
    .spyOn(fs.promises, 'access')
    .mockImplementation(
      async (
        filename: fs.PathLike,
        mode?: number | undefined
      ): Promise<void> => {}
    )
  const statMock = vi
    .spyOn(fs.promises, 'stat')
    .mockImplementation(async (filename: fs.PathLike): Promise<fs.Stats> => {
      return Object.assign(fs.statSync(import.meta.filename), {
        uid: 500,
        gid: 0
      })
    })
  const execMock = vi
    .spyOn(exec, 'exec')
    .mockImplementation(
      async (program: string, args?: string[]): Promise<number> => {
        return 0
      }
    )

  await tools.ensureSnapd()

  expect(accessMock).toHaveBeenCalled()
  expect(statMock).toHaveBeenCalled()
  expect(execMock).toHaveBeenCalledWith('sudo', ['chown', 'root:root', '/'])
})

test('ensureSnapcraft installs Snapcraft if needed', async () => {
  expect.assertions(2)

  const accessMock = vi
    .spyOn(fs.promises, 'access')
    .mockImplementation(
      async (
        filename: fs.PathLike,
        mode?: number | undefined
      ): Promise<void> => {
        throw new Error('not found')
      }
    )
  const execMock = vi
    .spyOn(exec, 'exec')
    .mockImplementation(
      async (program: string, args?: string[]): Promise<number> => {
        return 0
      }
    )

  await tools.ensureSnapcraft()

  expect(accessMock).toHaveBeenCalled()
  expect(execMock).toHaveBeenNthCalledWith(1, 'sudo', [
    'snap',
    'install',
    '--classic',
    'snapcraft'
  ])
})

test('ensureSnapcraft is a no-op if Snapcraft is installed', async () => {
  expect.assertions(2)

  const accessMock = vi
    .spyOn(fs.promises, 'access')
    .mockImplementation(
      async (
        filename: fs.PathLike,
        mode?: number | undefined
      ): Promise<void> => {
        return
      }
    )
  const execMock = vi
    .spyOn(exec, 'exec')
    .mockImplementation(
      async (program: string, args?: string[]): Promise<number> => {
        return 0
      }
    )

  await tools.ensureSnapcraft()

  expect(accessMock).toHaveBeenCalled()
  expect(execMock).not.toHaveBeenCalled()
})
