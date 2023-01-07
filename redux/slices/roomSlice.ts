import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Room, RoomApi, RoomType } from '../../api/RoomApi'
import { Axios } from '../../core/axios'

export type RoomsSliceState = {
  items: Room[]
}

const initialState: RoomsSliceState = {
  items: [],
}

const fetchCreateRoom = createAsyncThunk(
  'rooms/fetchCreateRoomStatus',
  async ({ title, type }: { title: string; type: RoomType }) => {
    const room: Room = await RoomApi(Axios).createRoom({
      title,
      type,
    })
    return room
  },
)

export const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    addRoom: (state, action: PayloadAction<Room>) => {
      state.items.push(action.payload)
    },
  },
  extraReducers: builder => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchCreateRoom.fulfilled, (state, action) => {
      // Add user to the state array
      state.items.push(action.payload)
    })
  },
})

export const { addRoom } = roomSlice.actions
export const roomsReducer = roomSlice.reducer
