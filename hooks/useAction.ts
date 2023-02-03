import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { AsyncThunk, unwrapResult } from '@reduxjs/toolkit'

export const useAsyncAction = <Arg, Returned>(
  actionCreator: AsyncThunk<Returned, Arg, {}>,
) => {
  const dispatch = useDispatch<any>()

  return useCallback(
    (arg: Arg) =>
      dispatch(actionCreator(arg))
        .then(result => unwrapResult(result))
        .catch(err => Promise.reject(err)),
    [dispatch, actionCreator],
  )
}
