import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Room, RoomApi, RoomType } from '../../api/RoomApi'
import { Axios } from '../../core/axios'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from '../types'

export type RoomsSliceState = {
  items: Room[]
}

const initialState: RoomsSliceState = {
  items: [],
}

export const fetchCreateRoom = createAsyncThunk(
  'rooms/fetchCreateRoomStatus',
  async ({ title, type }: { title: string; type: RoomType }) => {
    try {
      const room: Room = await RoomApi(Axios).createRoom({
        title,
        type,
      })
      return room
    } catch (error) {
      throw Error('Ошибка создания комнаты')
    }
  },
)

export const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.items = action.payload
    },
    setRoomSpeakers: (
      state,
      action: PayloadAction<{ speakers: Room['speakers']; roomId: number }>,
    ) => {
      state.items = state.items.map(room => {
        if (room.id === action.payload.roomId) {
          room.speakers = action.payload.speakers
        }
        return room
      })
    },
  },
  extraReducers: builder =>
    builder
      .addCase(
        fetchCreateRoom.fulfilled.type,
        (state, action: PayloadAction<Room>) => {
          state.items.push(action.payload)
        },
      )
      .addCase(HYDRATE as any, (state, action: PayloadAction<RootState>) => {
        state.items = action.payload.rooms.items
      }),
})

export const { setRooms, setRoomSpeakers } = roomSlice.actions
export const roomsReducer = roomSlice.reducer
